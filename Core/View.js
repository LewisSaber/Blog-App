class View {
    constructor(params = {}) {
        this.params = params
        this.rendered = false
    }

    addParams(params) {
        this.params = {...this.params, ...params}
        return this
    }

    addMainViewPath(path) {
        this.mainViewPath = path
        return this
    }

    addViewPath(path) {
        this.viewPath = path
        return this
    }

    render(response) {
        if (!this.rendered)
            response.render(this.viewPath, this.params, (err, viewHtml) => {
                console.log("Rendering", this.viewPath)
                if (err) {
                    // Handle error appropriately
                    console.error(err);
                    res.status(500).send('Internal Server Error');
                    return;
                }


                response.render(this.mainViewPath, {body: viewHtml, ...this.params});
            })
        this.rendered = true
        return this
    }


}

module.exports = View