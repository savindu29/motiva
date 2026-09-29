"""Tiny server for the FBX -> GLB conversion page.

  /            convert.html
  /three/...   motiva/node_modules/three
  /src/...     the 3ds Max export (../motiva-source-assets/3ds Max)
  /tex/...     the web-size textures
  POST /save   writes the request body to out/<name>
"""
import http.server, os, sys, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
MOTIVA = os.path.abspath(os.path.join(HERE, "..", ".."))
ROOTS = {
    "/three/": os.path.join(MOTIVA, "node_modules", "three"),
    # the 3ds Max export lives outside the project, next to it
    "/src/": os.path.join(MOTIVA, "..", "motiva-source-assets", "3ds Max"),
    "/tex/": os.path.join(HERE, "tex"),
}
TYPES = {".html": "text/html", ".js": "text/javascript", ".jpg": "image/jpeg", ".png": "image/png", ".fbx": "application/octet-stream"}


class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def do_GET(self):
        path = urllib.parse.unquote(urllib.parse.urlparse(self.path).path)
        if path == "/":
            f = os.path.join(HERE, "convert.html")
        else:
            f = None
            for pre, root in ROOTS.items():
                if path.startswith(pre):
                    f = os.path.join(root, path[len(pre):].replace("/", os.sep))
        if not f or not os.path.isfile(f):
            self.send_response(404); self.end_headers(); return
        data = open(f, "rb").read()
        self.send_response(200)
        self.send_header("Content-Type", TYPES.get(os.path.splitext(f)[1].lower(), "application/octet-stream"))
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        name = os.path.basename(q.get("name", ["out.bin"])[0])
        n = int(self.headers["Content-Length"])
        os.makedirs(os.path.join(HERE, "out"), exist_ok=True)
        with open(os.path.join(HERE, "out", name), "wb") as fh:
            fh.write(self.rfile.read(n))
        self.send_response(200); self.end_headers(); self.wfile.write(b"ok")
        print("saved", name, n, flush=True)


http.server.ThreadingHTTPServer(("127.0.0.1", int(sys.argv[1]) if len(sys.argv) > 1 else 8765), H).serve_forever()
