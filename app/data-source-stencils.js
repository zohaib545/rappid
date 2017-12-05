var App = App || {};
App.config = App.config || {};

(function(){
    'use strict'

    App.config.dataSourceStencil = {};
    App.config.dataSourceStencil.shapes = [
        {
            type: 'basic.Image',
            size: {
                width: 20,
                height: 20
            },
            attrs: {
                '.': {
                    'data-tooltip': 'RDBMS',
                    'data-tooltip-position': 'left'
                },
                image: {
                    width: 20,
                    height: 20,
                    'xlink:href': 'assets/images/add-database.png'
                },
                text: {
                    text: 'Relational Database',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 9,
                    display: '',
                    stroke: '#000',
                    'stroke-width': 0,
                    'fill': '#222138'
                }
            }
        },
        {
            type: 'basic.Image',
            size: {
                width: 20,
                height: 20
            },
            attrs: {
                '.': {
                    'data-tooltip': 'NO SQL',
                    'data-tooltip-position': 'left'
                },
                image: {
                    width: 20,
                    height: 20,
                    'xlink:href': 'assets/images/no-sql.png'
                },
                text: {
                    text: 'NOSQL Database',
                    'font-family': 'Roboto Condensed',
                    'font-weight': 'Normal',
                    'font-size': 9,
                    display: '',
                    stroke: '#000',
                    'stroke-width': 0,
                    'fill': '#222138'
                }
            }
        }
    ]
}())