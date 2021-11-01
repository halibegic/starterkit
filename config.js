module.exports = {
    config: {
        tailwindjs: './tailwind.config.js',
        port: 9050,
    },
    paths: {
        root: './',
        src: {
            css: './src/css',
            img: './src/img',
            js: './src/js',
            html: './src/html',
        },
        dist: {
            css: './dist/css',
            img: './dist/img',
            js: './dist/js',
            base: './dist',
        },
        build: {
            css: './build/css',
            img: './build/img',
            js: './build/js',
            base: './build',
        },
    },
};
