with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("const handleHashChange = () => {", "const handlePathChange = () => {")
content = content.replace("const hash = window.location.hash || '/';", "const path = window.location.pathname || '/';")
content = content.replace("setCurrentRoute(hash);", "setCurrentRoute(path);")
content = content.replace("const seo = getSeoInfoForRoute(hash);", "const seo = getSeoInfoForRoute(path);")
content = content.replace("handleHashChange();", "handlePathChange();")
content = content.replace("window.addEventListener('hashchange', handleHashChange);", "window.addEventListener('popstate', handlePathChange);")
content = content.replace("return () => window.removeEventListener('hashchange', handleHashChange);", "return () => window.removeEventListener('popstate', handlePathChange);")

content = content.replace("const handleNavigate = (routeHash: string) => {", "const handleNavigate = (routePath: string) => {")
content = content.replace("window.location.hash = routeHash === '/' ? '' : routeHash;", "window.history.pushState({}, '', routePath);")
content = content.replace("setCurrentRoute(routeHash);", "setCurrentRoute(routePath);")
content = content.replace("const seo = getSeoInfoForRoute(routeHash);", "const seo = getSeoInfoForRoute(routePath);")

with open("src/App.tsx", "w") as f:
    f.write(content)
