with open("src/lib/imageProcessor.ts", "r") as f:
    content = f.read()

content = content.replace("import { jsPDF } from 'jspdf';", "")
content = content.replace("import JSZip from 'jszip';", "")

old_pdf = """    const doc = new jsPDF({
      orientation: targetDim.width > targetDim.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [targetDim.width, targetDim.height],
    });"""
new_pdf = """    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.jsPDF;
    const doc = new jsPDF({
      orientation: targetDim.width > targetDim.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [targetDim.width, targetDim.height],
    });"""
content = content.replace(old_pdf, new_pdf)

old_pdf_multi = """  let doc: jsPDF | null = null;"""
new_pdf_multi = """  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.jsPDF;
  let doc: any | null = null;"""
content = content.replace(old_pdf_multi, new_pdf_multi)

old_zip = """  const zip = new JSZip();"""
new_zip = """  const JSZipModule = await import('jszip');
  const JSZip = JSZipModule.default;
  const zip = new JSZip();"""
content = content.replace(old_zip, new_zip)

with open("src/lib/imageProcessor.ts", "w") as f:
    f.write(content)
