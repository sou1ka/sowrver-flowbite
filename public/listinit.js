
window.datatables = {};
window.datatableInit = function(name) {
    if(window.datatables[name]) { return; }

    window.addEventListener(name, (e) => {console.log(e);
        window.datatables[name] = new simpleDatatables.DataTable("#" + name, {
            searchable: false,
            perPageSelect: false,
            perPage: e.detail.parSize
        });
        window.datatables[name].handler = e.detail.handler;

        window.datatables[name].on("datatable.selectrow", (rowIndex, event) => {
            event.preventDefault();
            var table = window.datatables[arguments[0]]
            var row = table.data.data[rowIndex].cells;
            table.handler({
                detail: JSON.parse(row[0].attributes['data-json'])
            });
        });
        
    });
}
