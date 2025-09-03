const fs = require('fs');
const path = require('path');

// This script will help you convert the Markdown to PDF
// You'll need to install the required packages first

console.log(`
📄 PDF Generation Script for Ihosi Healthcare Management System Pitch Deck

To convert the Markdown document to a polished PDF, you have several options:

1. **Using Pandoc (Recommended for professional output):**
   - Install Pandoc: https://pandoc.org/installing.html
   - Run: pandoc Ihosi_Healthcare_Management_System_Pitch_Deck.md -o Ihosi_Pitch_Deck.pdf --pdf-engine=wkhtmltopdf --css=styles.css

2. **Using Markdown-PDF (Node.js package):**
   - Install: npm install -g markdown-pdf
   - Run: markdown-pdf Ihosi_Healthcare_Management_System_Pitch_Deck.md

3. **Using VS Code with Markdown PDF extension:**
   - Install "Markdown PDF" extension in VS Code
   - Open the .md file and use Ctrl+Shift+P > "Markdown PDF: Export (pdf)"

4. **Using online converters:**
   - Upload the .md file to services like:
     - https://www.markdowntopdf.com/
     - https://md2pdf.netlify.app/
     - https://www.markdown-pdf.com/

5. **Using browser print:**
   - Open the .md file in a Markdown viewer
   - Use browser's print function to save as PDF

For the best results, I recommend using Pandoc with a custom CSS file for professional formatting.
`);

// Create a basic CSS file for better PDF formatting
const cssContent = `
/* Ihosi Healthcare Management System - PDF Styles */

@page {
    size: A4;
    margin: 2cm;
    @top-center {
        content: "Ihosi Healthcare Management System";
        font-size: 10pt;
        color: #666;
    }
    @bottom-center {
        content: "Page " counter(page);
        font-size: 10pt;
        color: #666;
    }
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 100%;
    font-size: 16px;
}

h1 {
    color: #2563eb;
    border-bottom: 3px solid #2563eb;
    padding-bottom: 10px;
    margin-top: 30px;
    margin-bottom: 20px;
    page-break-after: avoid;
}

h2 {
    color: #1e40af;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 8px;
    margin-top: 25px;
    margin-bottom: 15px;
    page-break-after: avoid;
}

h3 {
    color: #1e40af;
    margin-top: 20px;
    margin-bottom: 10px;
    page-break-after: avoid;
}

h4 {
    color: #374151;
    margin-top: 15px;
    margin-bottom: 8px;
    page-break-after: avoid;
}

p {
    margin-bottom: 12px;
    text-align: justify;
}

ul, ol {
    margin-bottom: 15px;
    padding-left: 25px;
}

li {
    margin-bottom: 5px;
}

strong {
    color: #1e40af;
    font-weight: 600;
}

em {
    color: #6b7280;
    font-style: italic;
}

blockquote {
    border-left: 4px solid #2563eb;
    padding-left: 20px;
    margin: 20px 0;
    background-color: #f8fafc;
    padding: 15px 20px;
    border-radius: 0 5px 5px 0;
}

code {
    background-color: #f1f5f9;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
}

pre {
    background-color: #f1f5f9;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
    margin: 15px 0;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    page-break-inside: avoid;
}

th, td {
    border: 1px solid #d1d5db;
    padding: 12px;
    text-align: left;
}

th {
    background-color: #f3f4f6;
    font-weight: 600;
    color: #1e40af;
}

hr {
    border: none;
    border-top: 2px solid #e5e7eb;
    margin: 30px 0;
}

/* Benefits section styling */
.benefits-section {
    background-color: #f8fafc;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
    border-left: 4px solid #10b981;
}

/* Contact section styling */
.contact-section {
    background-color: #1e40af;
    color: white;
    padding: 30px;
    border-radius: 8px;
    margin: 30px 0;
}

.contact-section h2, .contact-section h3 {
    color: white;
    border-bottom: 2px solid #3b82f6;
}

/* Page breaks */
.page-break {
    page-break-before: always;
}

/* Avoid breaking these elements */
h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
}

table, pre, blockquote {
    page-break-inside: avoid;
}

/* Footer styling */
.footer {
    margin-top: 50px;
    padding-top: 20px;
    border-top: 2px solid #e5e7eb;
    text-align: center;
    color: #6b7280;
    font-size: 0.9em;
}
`;

// Write the CSS file
fs.writeFileSync('styles.css', cssContent);

console.log(`
✅ Created styles.css file for professional PDF formatting

📋 Next Steps:
1. Install Pandoc: https://pandoc.org/installing.html
2. Install wkhtmltopdf: https://wkhtmltopdf.org/downloads.html
3. Run the following command:

pandoc Ihosi_Healthcare_Management_System_Pitch_Deck.md -o Ihosi_Pitch_Deck.pdf --pdf-engine=wkhtmltopdf --css=styles.css --toc --toc-depth=2

This will create a professional PDF with:
- Table of contents
- Custom styling
- Page numbers
- Professional formatting
- Proper page breaks

Alternative command for different PDF engine:
pandoc Ihosi_Healthcare_Management_System_Pitch_Deck.md -o Ihosi_Pitch_Deck.pdf --pdf-engine=weasyprint --css=styles.css --toc --toc-depth=2
`);

// Create a simple HTML version for browser viewing
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ihosi Healthcare Management System - Pitch Deck</title>
    <style>
        ${cssContent}
        
        /* Additional styles for HTML version */
        body {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            z-index: 1000;
        }
        
        .print-button:hover {
            background-color: #1d4ed8;
        }
        
        @media print {
            .print-button {
                display: none;
            }
        }
    </style>
</head>
<body>
    <button class="print-button" onclick="window.print()">🖨️ Print PDF</button>
    
    <div id="content">
        <!-- Content will be inserted here -->
    </div>
    
    <script>
        // Load and display the markdown content
        fetch('Ihosi_Healthcare_Management_System_Pitch_Deck.md')
            .then(response => response.text())
            .then(markdown => {
                // Simple markdown to HTML conversion
                let html = markdown
                    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
                    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                    .replace(/^- (.*$)/gim, '<li>$1</li>')
                    .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
                    .replace(/\n\n/gim, '</p><p>')
                    .replace(/^(?!<[h|u|l])/gim, '<p>')
                    .replace(/(<p>.*<\/p>)/gims, '$1')
                    .replace(/---/gim, '<hr>');
                
                document.getElementById('content').innerHTML = html;
            })
            .catch(error => {
                console.error('Error loading markdown:', error);
                document.getElementById('content').innerHTML = '<p>Error loading content. Please ensure the markdown file exists.</p>';
            });
    </script>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync('Ihosi_Pitch_Deck.html', htmlTemplate);

console.log(`
✅ Created Ihosi_Pitch_Deck.html for browser viewing and printing

🌐 You can now:
1. Open Ihosi_Pitch_Deck.html in your browser
2. Use the "Print PDF" button to generate a PDF
3. Or use Ctrl+P to print directly from the browser

📁 Files created:
- Ihosi_Healthcare_Management_System_Pitch_Deck.md (Markdown source)
- styles.css (Professional styling)
- Ihosi_Pitch_Deck.html (Browser-ready version)
- generate_pdf.js (This script)
`);
