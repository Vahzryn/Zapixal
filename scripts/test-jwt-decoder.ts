import { decodeJwt, verifyHmacSignature, base64UrlDecode, SAMPLE_JWTS } from '../src/lib/jwtDecoder';
import { createHmac } from 'node:crypto';

async function runTests() {
  console.log('--- RUNNING RIGOROUS JWT DECODER & CRYPTOGRAPHIC VERIFICATION TESTS ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${name}`);
      failed++;
    }
  }

  // 1. Decode Auth0 Sample
  const resAuth0 = decodeJwt(SAMPLE_JWTS.auth0.token, 1700000000);
  assert(resAuth0.valid, 'Auth0 token decoded as valid');
  assert(resAuth0.algorithm === 'HS256', 'Auth0 algorithm detected as HS256');
  assert(resAuth0.payload?.sub === 'auth0|657381923894', 'Auth0 sub claim matches');
  assert(resAuth0.payload?.email === 'alex.morgan@example.com', 'Auth0 email claim matches');
  assert(resAuth0.expirationStatus === 'active', 'Auth0 token is marked as active at epoch 1700000000');

  // 2. Decode Expired Sample
  const resExpired = decodeJwt(SAMPLE_JWTS.expired.token, 1700000000);
  assert(resExpired.valid, 'Expired token decoded as valid structure');
  assert(resExpired.expirationStatus === 'expired', 'Expired token correctly flagged as expired');
  assert(resExpired.expirationTime.unix === 1516239032, 'Expiration timestamp matches');

  // 3. Decode Firebase ID Token (RS256 Asymmetric)
  const resFirebase = decodeJwt(SAMPLE_JWTS.firebase.token);
  assert(resFirebase.valid, 'Firebase token decoded as valid');
  assert(resFirebase.algorithm === 'RS256', 'Firebase algorithm detected as RS256');
  assert(resFirebase.payload?.iss === 'https://securetoken.google.com/zapixal-auth-demo', 'Firebase issuer matches');
  assert(resFirebase.header?.kid === 'f5a326a3df8e7421b4e240a8980dda901bdc1db7', 'Firebase header key ID (kid) matches');

  // 4. Decode Nested RBAC Token
  const resNested = decodeJwt(SAMPLE_JWTS.nested.token);
  assert(resNested.valid, 'Nested token decoded as valid');
  assert(typeof resNested.payload?.permissions === 'object', 'Nested permissions parsed as object');
  assert((resNested.payload?.permissions as any)?.images?.includes('read'), 'Permission list contains read');
  assert(resNested.payload?.org_name === 'Zapixal Enterprise', 'Nested org_name parsed correctly');

  // 5. Decode Empty String & Whitespace
  const resEmpty = decodeJwt('   ');
  assert(!resEmpty.valid, 'Empty string returns invalid');
  assert(resEmpty.error?.includes('paste a JWT') === true, 'Empty token error message provided');

  // 6. Detect JWE Encrypted Tokens (5 parts)
  const jweToken = 'eyJhbGciOiJSU0EtT0FFUCJ9.6KB707dMEIKYIsAR.KOorQI7FSvW11.597YhYS1BMt.FkdO13Yh';
  const resJwe = decodeJwt(jweToken);
  assert(!resJwe.valid, 'JWE token correctly identified as non-JWS token');
  assert(resJwe.isJwe === true, 'JWE flag is true');
  assert(resJwe.error?.includes('JWE') === true, 'JWE specific informative error returned');

  // 7. Invalid Token Formats & Missing Segments
  const resSingle = decodeJwt('singlePartOnly');
  assert(!resSingle.valid, 'Single part string is invalid');
  assert(resSingle.error?.includes('3 dot-separated') === true, 'Error indicates expected 3 segments');

  const resFour = decodeJwt('a.b.c.d');
  assert(!resFour.valid, 'Four segments is invalid');

  const resEmptyHeader = decodeJwt('.eyJzdWIiOiIxMjMifQ.sig');
  assert(!resEmptyHeader.valid, 'Empty header segment is rejected');

  const resEmptyPayload = decodeJwt('eyJhbGciOiJIUzI1NiJ9..sig');
  assert(!resEmptyPayload.valid, 'Empty payload segment is rejected');

  // 8. Base64URL Decoding with UTF-8 Unicode characters
  const unicodeJson = JSON.stringify({ user: 'München 🚀', role: 'admin' });
  const b64UrlUnicode = Buffer.from(unicodeJson, 'utf-8').toString('base64url');
  const decodedUtf8 = base64UrlDecode(b64UrlUnicode);
  assert(decodedUtf8 === unicodeJson, 'base64UrlDecode preserves multi-byte UTF-8 Unicode emojis and umlauts');

  // 9. Base64URL with invalid characters
  try {
    base64UrlDecode('invalid!characters@#$');
    assert(false, 'base64UrlDecode should throw on invalid characters');
  } catch (err: any) {
    assert(err.message.includes('Malformed Base64URL'), 'base64UrlDecode throws on illegal characters');
  }

  // 10. Base64URL length modulo 4 === 1
  try {
    base64UrlDecode('abcde'); // length 5 -> mod 4 is 1
    assert(false, 'base64UrlDecode should throw on modulo 4 === 1 length');
  } catch (err: any) {
    assert(err.message.includes('Illegal Base64URL string length'), 'Illegal length modulo 1 throws cleanly');
  }

  // 11. Bearer Token Prefix Auto-Stripping
  const bearerToken = `Bearer ${SAMPLE_JWTS.auth0.token}`;
  const resBearer = decodeJwt(bearerToken);
  assert(resBearer.valid, 'Bearer prefix automatically stripped and parsed successfully');

  // 12. Timestamp & Expiration Matrix (Deterministic Clock)
  // Token with exp=1000, nbf=500, iat=100
  const timeHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const timePayload = Buffer.from(JSON.stringify({ sub: 'user_1', exp: 1000, nbf: 500, iat: 100 })).toString('base64url');
  const timeToken = `${timeHeader}.${timePayload}.dummy_sig`;

  // Before nbf (now = 400) -> immature
  const resImmature = decodeJwt(timeToken, 400);
  assert(resImmature.expirationStatus === 'immature', 'Clock before nbf is marked as immature');

  // Active (now = 750) -> active
  const resActive = decodeJwt(timeToken, 750);
  assert(resActive.expirationStatus === 'active', 'Clock between nbf and exp is marked as active');
  assert(resActive.expirationTime.isExpired === false, 'isExpired is false');

  // Expired (now = 1050) -> expired
  const resPast = decodeJwt(timeToken, 1050);
  assert(resPast.expirationStatus === 'expired', 'Clock after exp is marked as expired');
  assert(resPast.expirationTime.isExpired === true, 'isExpired is true');

  // 13. HS256 HMAC Signature Verification: Valid & Invalid
  const hmacHeader = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const hmacPayload = Buffer.from(JSON.stringify({ sub: '1234567890', name: 'John Doe', iat: 1516239022 })).toString('base64url');
  const secret = 'my-secret-key-123456';
  
  const hmac256 = createHmac('sha256', secret);
  hmac256.update(`${hmacHeader}.${hmacPayload}`);
  const validSig256 = hmac256.digest('base64url');

  const verifyHs256 = await verifyHmacSignature(hmacHeader, hmacPayload, validSig256, 'HS256', secret, false);
  assert(verifyHs256.checked && verifyHs256.isValid, 'HS256 HMAC signature verification succeeds with correct secret');

  const verifyHs256Wrong = await verifyHmacSignature(hmacHeader, hmacPayload, validSig256, 'HS256', 'wrong-key', false);
  assert(verifyHs256Wrong.checked && !verifyHs256Wrong.isValid, 'HS256 HMAC verification fails with wrong secret');

  // 14. HS384 HMAC Signature Verification
  const hmacHeader384 = Buffer.from(JSON.stringify({ alg: 'HS384', typ: 'JWT' })).toString('base64url');
  const hmac384 = createHmac('sha384', secret);
  hmac384.update(`${hmacHeader384}.${hmacPayload}`);
  const validSig384 = hmac384.digest('base64url');

  const verifyHs384 = await verifyHmacSignature(hmacHeader384, hmacPayload, validSig384, 'HS384', secret, false);
  assert(verifyHs384.checked && verifyHs384.isValid, 'HS384 HMAC signature verification succeeds with correct secret');

  // 15. HS512 HMAC Signature Verification
  const hmacHeader512 = Buffer.from(JSON.stringify({ alg: 'HS512', typ: 'JWT' })).toString('base64url');
  const hmac512 = createHmac('sha512', secret);
  hmac512.update(`${hmacHeader512}.${hmacPayload}`);
  const validSig512 = hmac512.digest('base64url');

  const verifyHs512 = await verifyHmacSignature(hmacHeader512, hmacPayload, validSig512, 'HS512', secret, false);
  assert(verifyHs512.checked && verifyHs512.isValid, 'HS512 HMAC signature verification succeeds with correct secret');

  // 16. Base64 Encoded Secret Handling
  const rawKey = 'binary-secret-123';
  const base64Secret = Buffer.from(rawKey, 'utf-8').toString('base64');
  const hmacB64Key = createHmac('sha256', Buffer.from(base64Secret, 'base64'));
  hmacB64Key.update(`${hmacHeader}.${hmacPayload}`);
  const validSigB64Key = hmacB64Key.digest('base64url');

  const verifyB64Secret = await verifyHmacSignature(hmacHeader, hmacPayload, validSigB64Key, 'HS256', base64Secret, true);
  assert(verifyB64Secret.checked && verifyB64Secret.isValid, 'Base64 encoded secret verification matches computed HMAC digest');

  // 17. Algorithm "none" Security (Must NOT be verified as authenticated)
  const verifyNone = await verifyHmacSignature(hmacHeader, hmacPayload, '', 'none', 'any-secret', false);
  assert(!verifyNone.isValid && !verifyNone.checked, 'alg: "none" is rejected from cryptographic HMAC verification');

  // 18. Asymmetric Algorithm Rejection (RS256, ES256, PS256)
  const verifyRs = await verifyHmacSignature(hmacHeader, hmacPayload, validSig256, 'RS256', secret, false);
  assert(!verifyRs.checked && !verifyRs.isValid, 'RS256 correctly returns asymmetric guidance');
  assert(verifyRs.message.includes('Asymmetric algorithm'), 'RS256 message states asymmetric requirement');

  const verifyEs = await verifyHmacSignature(hmacHeader, hmacPayload, validSig256, 'ES384', secret, false);
  assert(!verifyEs.checked && !verifyEs.isValid, 'ES384 correctly returns asymmetric guidance');

  // 19. Empty Secret Handling
  const verifyEmptySecret = await verifyHmacSignature(hmacHeader, hmacPayload, validSig256, 'HS256', '', false);
  assert(!verifyEmptySecret.checked && !verifyEmptySecret.isValid, 'Empty secret returns prompt');

  // 20. Tampered Payload Detection
  const tamperedPayload = Buffer.from(JSON.stringify({ sub: '1234567890', name: 'Tampered Hacker', iat: 1516239022 })).toString('base64url');
  const verifyTampered = await verifyHmacSignature(hmacHeader, tamperedPayload, validSig256, 'HS256', secret, false);
  assert(verifyTampered.checked && !verifyTampered.isValid, 'Tampered payload correctly fails signature verification');

  console.log(`\n========================================`);
  console.log(`ALL TESTS COMPLETE: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
