const docma = require('docma');

const config = {
    "src": [
        "./om.js"
    ],
    "dest": "./docs",
    "debug": true,
    template: {
        // Template-specific options
        options: {
            title: "OpenMap Library",
            sidebar: true,
            collapsed: false,
            badges: true,
            search: true,
            toolbar: true,
            symbolMeta: true,
            outline: "tree",
            animations: true,
            navbar: true,
            navItems: [
                {
                    label: "Documentation",
                    href: "#",
                    iconClass: "ico-book"
                },
                {
                    label: "Demos",
                    href: "#",
                    iconClass: "ico-mouse-pointer"
                },
                {
                    label: "Download",
                    iconClass: "ico-md ico-download",
                    items: [
                        {
                            label: "Source Code",
                            href: "#"
                        },
                        {
                            label: "Zip",
                            href: "https://codeload.github.com/lucienlugeek/om/zip/master"
                        }
                    ]
                },
                {
                    label: "GitHub",
                    href: "https://github.com/lucienlugeek/om",
                    target: "_blank",
                    iconClass: "ico-md ico-github"
                }
            ]
        }
    }
};

docma.create()
    .build(config)
    .catch(err => {
        console.log(err);
    })