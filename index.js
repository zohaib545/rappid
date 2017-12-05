var App = window.App || {};

(function (_, joint) {
    'use strict'

    App.MainView = joint.mvc.View.extend({
        className: 'app',

        init: function () {
            this.initializeUI();
            this.initializePaper();
            this.initializeStencil();
            this.initializeHaloAndInspector();
            this.initializeSelection();
            this.initializeKeyboardShortcuts();
            this.initializeDataSourceStencils();
        },

        initializeStencil: function () {

            var stencil = this.stencil = new joint.ui.Stencil({
                paper: this.paperScroller,
                snaplines: this.snaplines,
                scaleClones: true,
                width: 240,
                groups: App.config.stencil.groups,
                dropAnimation: true,
                groupsToggleButtons: true,
                search: {
                    '*': ['type', 'attrs/text/text', 'attrs/.label/text'],
                    'org.Member': ['attrs/.rank/text', 'attrs/.name/text']
                },
                // Use default Grid Layout
                layout: true,
                // Remove tooltip definition from clone
                dragStartClone: function (cell) {
                    return cell.clone().removeAttr('./data-tooltip');
                }
            });
            $('.stencil-container').append(stencil.el);
            stencil.render().load(App.config.stencil.shapes);
        },

        initializeDataSourceStencils: function(){
            let dataStencil = this.dataSourcestencil = new joint.ui.Stencil({
                paper: this.paperScroller,
                snaplines: this.snaplines,
                scaleClones: true,
                width: 240,
                height: 150,
                dropAnimation: true,
                layout: true,
                // groups: App.config.dataSourceStencil.groups
            });
            $('.data-source-stencils').append(dataStencil.el);
            console.log(dataStencil);
            dataStencil.render().load(App.config.dataSourceStencil.shapes)
        },

        initializePaper: function () {
            var graph = this.graph = new joint.dia.Graph;
            graph.on('add', function (cell, collection, opt) {
                if (opt.stencil) this.createInspector(cell);
            }, this);

            this.commandManager = new joint.dia.CommandManager({ graph: graph });

            var paper = this.paper = new joint.dia.Paper({
                gridSize: 5,
                drawGrid: true,
                width: window.innerWidth - 100,
                height: window.innerHeight - 100,
                model: graph,
                defaultLink: new joint.shapes.app.Link
            });


            this.snaplines = new joint.ui.Snaplines({ paper: paper });

            var paperScroller = this.paperScroller = new joint.ui.PaperScroller({
                paper: paper,
                autoResizePaper: true,
                cursor: 'grab'
            });

            $('#paper').append(paperScroller.el);
            paperScroller.render().center();
        },

        createInspector: function (cell) {

            return joint.ui.Inspector.create('.inspector-container', _.extend({
                cell: cell
            }, App.config.inspector[cell.get('type')]));
        },

        initializeHaloAndInspector: function () {

            this.paper.on('element:pointerup link:options', function (cellView) {

                var cell = cellView.model;
                if (!this.selection.collection.includes(cell)) {

                    if (cell.isElement()) {

                        new joint.ui.FreeTransform({
                            cellView: cellView,
                            allowRotation: false,
                            preserveAspectRatio: !!cell.get('preserveAspectRatio'),
                            allowOrthogonalResize: cell.get('allowOrthogonalResize') !== false
                        }).render();

                        // new joint.ui.Halo({
                        //     cellView: cellView,
                        //     // handles: App.config.halo.handles
                        // }).render();

                        this.selection.collection.reset([]);
                        this.selection.collection.add(cell, { silent: true });
                    }

                    this.createInspector(cell);
                }
            }, this);
        },

        initializeKeyboardShortcuts: function () {

            this.keyboard = new joint.ui.Keyboard();
            this.keyboard.on({

                'ctrl+c': function () {
                    // Copy all selected elements and their associated links.
                    this.clipboard.copyElements(this.selection.collection, this.graph);
                },

                'ctrl+v': function () {

                    var pastedCells = this.clipboard.pasteCells(this.graph, {
                        translate: { dx: 20, dy: 20 },
                        useLocalStorage: true
                    });

                    var elements = _.filter(pastedCells, function (cell) {
                        return cell.isElement();
                    });

                    // Make sure pasted elements get selected immediately. This makes the UX better as
                    // the user can immediately manipulate the pasted elements.
                    this.selection.collection.reset(elements);
                },

                'ctrl+x shift+delete': function () {
                    this.clipboard.cutElements(this.selection.collection, this.graph);
                },

                'delete backspace': function (evt) {
                    evt.preventDefault();
                    this.graph.removeCells(this.selection.collection.toArray());
                },

                'ctrl+z': function () {
                    this.commandManager.undo();
                    this.selection.cancelSelection();
                },

                'ctrl+y': function () {
                    this.commandManager.redo();
                    this.selection.cancelSelection();
                },

                'ctrl+a': function () {
                    this.selection.collection.reset(this.graph.getElements());
                },

                'ctrl+plus': function (evt) {
                    evt.preventDefault();
                    this.paperScroller.zoom(0.2, { max: 5, grid: 0.2 });
                },

                'ctrl+minus': function (evt) {
                    evt.preventDefault();
                    this.paperScroller.zoom(-0.2, { min: 0.2, grid: 0.2 });
                },

                'keydown:shift': function (evt) {
                    this.paperScroller.setCursor('crosshair');
                },

                'keyup:shift': function () {
                    this.paperScroller.setCursor('grab');
                }

            }, this);
        },

        initializeSelection: function () {

            this.clipboard = new joint.ui.Clipboard();
            this.selection = new joint.ui.Selection({
                paper: this.paper,
                handles: App.config.selection.handles
            });

            // Initiate selecting when the user grabs the blank area of the paper while the Shift key is pressed.
            // Otherwise, initiate paper pan.
            this.paper.on('blank:pointerdown', function (evt, x, y) {

                if (this.keyboard.isActive('shift', evt)) {
                    this.selection.startSelecting(evt);
                } else {
                    this.selection.cancelSelection();
                    this.paperScroller.startPanning(evt, x, y);
                }

            }, this);

            this.paper.on('element:pointerdown', function (elementView, evt) {

                // Select an element if CTRL/Meta key is pressed while the element is clicked.
                if (this.keyboard.isActive('ctrl meta', evt)) {
                    this.selection.collection.add(elementView.model);
                }

            }, this);

            this.paper.on('cell:pointerdblclick', function(cellView, evt, x, y){
                console.log(cellView);
                $('.ui.mini.modal').modal('show');
            }, this);

            this.selection.on('selection-box:pointerdown', function (elementView, evt) {

                // Unselect an element if the CTRL/Meta key is pressed while a selected element is clicked.
                if (this.keyboard.isActive('ctrl meta', evt)) {
                    this.selection.collection.remove(elementView.model);
                }

            }, this);
        },

        initializeUI: function () {
            // $('.fixed.menu').transition('fade in');
            $('.ui.left.sidebar').sidebar('setting', 'transition', 'overlay').sidebar('attach events', '.toc.item');
            $('.paper-container').height(window.innerHeight - 150);
            $('.ui.longer.modal').modal({
                blurring: true,
                closable: false
            }).modal('show');

            $('.ui.mini.modal').modal({
                blurring: true
            })

        }
    })
}(_, joint))