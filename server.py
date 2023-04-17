import http.server
import socketserver
from urllib import parse

PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_url = parse.urlparse(self.path)
        if parsed_url.path.endswith(".js"):
            self.send_response(200)
            self.send_header("Content-Type", "application/javascript")
            self.end_headers()
            with open(parsed_url.path[1:], "rb") as f:
                self.wfile.write(f.read())
        else:
            return super().do_GET()

Handler = CustomHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving on port {PORT}")
    httpd.serve_forever()
