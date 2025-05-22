
class FinxScreen {
    constructor(obj) {
        this.content = obj?.content
        this.style = obj?.style
        this.title = obj.title ? obj.title : "Page Title"
    }
    getHTML() {
        let prehtml = [
            "<html><head>",
            "<title>" + this.title + "</title>",
            "</head>",
            `<body style="margin:0;${objToCSS(this?.style)}">`,
        ]
        let posthtml = `</body></html>`
        let html = [prehtml.join(""), this.content.join("\n"), posthtml].join("\n")
        return html
    }
    toString() {
        return this.getHTML()
    }
    valueOf() {
        return this.getHTML()
    }
}

function objToCSS(str) {
    if (!str) return ""
    return Object.entries(str).map(([key, value]) => `${key.replaceAll("_","-")}: ${value}`).join('; ') + ';'
}

class Widget {
    constructor(obj) {
        this.content = obj.content ? obj.content : ""
        this.style = obj?.style
        this.onclick = obj?.onclick
    }
    toString() {
        return this.getHTML()
    }
    getHTML() {
        let style = objToCSS(this.style)
        let attr = [
            `style="${style}"`
        ]
        let content = Array.isArray(this.content) ? this.content.join("") : this.content
        let html = `<div ${attr.join(" ")}>${content}</div>`
        return html
    }
}
class Link {
    constructor(txt, path, obj) {
        this.text = txt ? txt : "Link"
        this.path = path ? path : "/"
        this.style = obj?.style
    }
    toString() {
        return this.getHTML()
    }
    getHTML() {
        let style = objToCSS(this.style)
        let attr = [
            `style="${style}"`
        ]
        let html = `<a href="${this.path}" ${attr.join(" ")}>${this.text}</a>`
        return html
    }
}

import { createServer } from 'http'

class FinxServer {
    constructor(obj) {
        this.port = obj?.port
        this.server = null
        this.routes = new Map()
        if (obj.routes) {
            for (let i = 0; i < Object.keys(obj.routes).length; i++) { let route = Object.keys(obj.routes)[i];
                this.addRoute(route, obj.routes[route])
            }
        }
        if (obj.routeHandler) {
            
        }
        if (obj.start) {
            this.start()
        }
    }

    addRoute(path, content) {
        this.routes.set(path, (req, res) => {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(content.toString())
        })
    }

    start() {
        this.server = createServer((req, res) => {
            let handler = this.routes.get(req.url)
            if (handler) {
                handler(req, res)
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' })
                res.end('Not Found')
            }
        });

        this.server.listen(this.port, () => {
            console.log(`Server running at http://localhost:${this.port}/`)
        })
    }

    stop() {
        if (this.server) {
            this.server.close(() => {
                console.log('Server stopped')
            })
        }
    }
}

let l0 = 0.08
let l1 = 0.12

let NavItem = {
    display: "inline-block",
    margin_right: "8pt",
    font_size: "14pt",
    color: "red",
    cursor: "pointer"
}

let NavigationBar = new Widget({
    style: {
        background: new Shade(l1),
        padding: "12pt 24pt",
        color: "white"
    },
    content: [
        new Widget({
            content: "Home",
            style: NavItem
        }),
        new Widget({
            content: "Watch",
            style: NavItem
        })
    ]
})

let VideoDisplay = new Widget({
    style: {
        height: "200px",
        width: "400px",
        margin: "50px",
        background: new Shade(l1)
    },
    content: [
        "Hi"
    ]
})

let VideoData = new Widget({
    style: {
        height: "50px"
    }
})

function getPageContent(path) {
    let pageMap = {
        "home": [
            NavigationBar
        ],
        "watch": [
            NavigationBar,
            VideoDisplay
        ]
    }
    return pageMap?.[path]
}

function getScreen(path) {
    let templateScreen = new FinxScreen({
        title: "Finx UI / " + path,
        content: getPageContent(path),
        style: {
            background: "black",
            color: "white"
        }
    })
    return templateScreen
}

let server = new FinxServer({
    port: 3080,
    routes: {
        "/": getScreen("home"),
        "/watch": getScreen("watch")
    },
    start: true
})