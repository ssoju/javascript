(function () {
    d3.circleText = function () {
        "use strict";
        var radius = function (d) {
                return d.r;
            },
            value = function (d) {
                return d.value;
            },
            fontSize = d3.functor('100%'),
            method = "stretch", spacing = "auto",
            precision = 1;

        function _draw(selection) {

            selection.each(function (d, i) {
                var g = d3.select(this);

                // Generate a unique id for the path
                var arcId = 'id-' + guid();

                g.selectAll('path.arc-path')
                    .data([d])
                    .enter()
                    .append('path')
                    .classed('arc-path', true);

                g.selectAll('path.arc-path')
                    .attr('id', arcId)
                    .attr('d', function (d) {
                        return circle_d(radius(d));
                    });

                g.selectAll('text.arc-text')
                    .data([d])
                    .enter()
                    .append('text')
                    .classed('arc-text', true)
                    .append('textPath')
                    .attr('startOffset', '0%');

                var arcText = g.selectAll('text.arc-text')
                    .style('font-size', fontSize);

                /* There is a bug in Chrome which makes it impossible to select
                 * camel case tags, like textPath.  Hence, using the :first-child
                 * selector to select the embedded textPath element.
                 *
                 * https://github.com/mbostock/d3/issues/925
                 * https://bugs.webkit.org/show_bug.cgi?id=46800
                 * https://bugs.webkit.org/show_bug.cgi?id=83438
                 *
                 * Keep the textPath hidden until the best position
                 * has been found.
                 */
                var arcTextPath = arcText.select(':first-child')
                    .attr('xlink:href', '#' + arcId)
                    .attr('visibility', 'hidden')
                    .attr('method', method)
                    .attr('spacing', spacing)
                    .text(value);

                var textBBox = arcText.node().getBBox(),
                    curTuple,
                    bestOffset = 0;

                var bestTuple = [
                    Math.abs(textBBox.width + textBBox.x * 2),
                    textBBox.height
                ];

                for (var ii = 0; ii <= 50; ii += precision) {
                    arcTextPath.attr('startOffset', ii + '%');

                    textBBox = arcText.node().getBBox();
                    curTuple = [
                        Math.abs(textBBox.width + textBBox.x * 2),
                        textBBox.height
                    ];

                    if (tupleSort(curTuple, bestTuple) < 0) {
                        bestOffset = ii;
                        bestTuple = curTuple;
                    }
                }

                arcTextPath
                    .attr('startOffset', bestOffset + '%')
                    .attr('visibility', null);
            });

            return selection.selectAll('text.arc-text');
        }

        /***************************************
         * Private functions
         */

        /* Code for generating UUID version 4 from:
         * http://note19.com/2007/05/27/javascript-guid-generator/
         */
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        function guid() {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        }

        function circle_d(r) {
            return ["M0,0",
                "m", "0,", -r,
                "a", r, ",", r, " 0 1,0 0,", 2 * r,
                "a", r, ",", r, " 0 1,0 0,", -2 * r
            ].join('');
        }

        function tupleSort(a, b) {
            if (a[0] == b[0]) {
                return (a[1] == b[1]) ? 0 : (a[1] < b[1]) ? -1 : 1;
            } else {
                return (a[0] < b[0]) ? -1 : 1;
            }
        }

        /***************************************
         * Public properties
         */
        _draw.radius = function (_) {
            if (arguments.length === 0) return radius;
            radius = d3.functor(_);
            return _draw;
        };

        _draw.value = function (_) {
            if (arguments.length === 0) return value;
            value = d3.functor(_);
            return _draw;
        };

        _draw.precision = function (_) {
            if (arguments.length === 0) return precision;
            precision = _;
            return _draw;
        };

        _draw.fontSize = function (_) {
            if (arguments.length === 0) return fontSize;
            fontSize = d3.functor(_);
            return _draw;
        };

        _draw.method = function (_) {
            if (arguments.length === 0) return method;
            method = _;
            return _draw;
        };

        _draw.spacing = function (_) {
            if (arguments.length === 0) return spacing;
            spacing = _;
            return _draw;
        };

        return _draw;
    };
})();


var dataset = {
    apples: [53245, 28479, 19697, 24037, 40245],
};

var circles = [
    {
        cx: 200,
        cy: 300,
        r: 15,
        text: 'A'
    },
    {
        cx: 400,
        cy: 300,
        r: 50,
        text: 'plugin'
    },
    {
        cx: 600,
        cy: 300,
        r: 100,
        text: 'for text inside circles!'
    }
];


var width = 460,
    height = 300,
    radius = Math.min(width, height) / 2,
    color = d3.scale.category10(),
    pie = d3.layout.pie().sort(null),
    arc = d3.svg.arc()
        .innerRadius(radius - 100)
        .outerRadius(radius - 50);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var path = svg.selectAll("path")
    .data(pie(dataset.apples))
    .enter().append("path")
    .attr("fill", function (d, i) {
        return color(i);
    })
    .attr("d", arc);

var circleText = d3.circleText()
    .radius(function (d) {
        return d.r - 5;
    })
    .value(function (d) {
        return d.text;
    })
    .precision(0.1);

var gs = svg.selectAll('g')
    .data(circles)
    .enter()
    .append('g')
    .attr('transform', function (d) {
        return 'translate(0, 0)';
    });


gs.append('circle')
    .attr('cx', 0).attr('cy', 0)
    .attr('r', function (d) {
        return d.r;
    })
    .attr('fill', function (d, i) {
        return color(i);
    })
    .attr('fill-opacity', '0.3');

var texts = gs.call(circleText);
