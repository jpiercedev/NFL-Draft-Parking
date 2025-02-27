// QR Scanner Bundle for Browser
(function(global) {
    // Fetch the QR Scanner library from node_modules
    fetch('/node_modules/qr-scanner/qr-scanner.min.js')
        .then(response => response.text())
        .then(code => {
            // Convert ES module to browser-friendly code
            const browserCode = code
                .replace('export default', 'var QrScanner =')
                .replace('export {', '// export {')
                .replace('};', '// };');
            
            // Execute the code
            const script = document.createElement('script');
            script.textContent = browserCode;
            document.head.appendChild(script);
            
            // Notify that QR Scanner is loaded
            const event = new Event('qrScannerLoaded');
            document.dispatchEvent(event);
        })
        .catch(error => {
            console.error('Error loading QR Scanner:', error);
            const event = new CustomEvent('qrScannerError', { detail: error });
            document.dispatchEvent(event);
        });
})(window);
