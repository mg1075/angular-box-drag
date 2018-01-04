(function () {
    'use strict';

    angular
        .module('boxDrag', [])
        .directive('boxDrag', boxDrag);

    boxDrag.$inject = ['$document'];

    /* @ngInject */
    function boxDrag($document) {
        /**
         * Usage:
         * Make an element draggable like jQueryUI does,
         * but without using jQueryUI.
         *
         * Common intended use case: you want to show an box, similar to a gmail compose window, in the
         * bottom right corner of the page, and you want this box to be draggable.
         *
         * Inspired by angular documentation: https://docs.angularjs.org/guide/compiler
         */
        var directive = {
            link: link,
            restrict: 'E'
        };
        return directive;

        function link(scope, element, attrs) {
            var startX = 0,
                startY = 0,
                x = 0,
                y = 20;

            element.appendTo('body');

            element.css({
                position: 'fixed',
                top: attrs.top || undefined,
                left: attrs.left || undefined,
                bottom: attrs.bottom || '20px',
                right: attrs.right || '20px',
                width: attrs.width || '400px'
            });

            angular.element(element[0].querySelector('div.box-drag-header')).css({
                padding: attrs.paddingHeader || '7px 10px'
            });

            var bodyOverflowY_prop = attrs.bodyOverflowY || 'inherit';

            angular.element(element[0].querySelector('div.box-drag-body')).css({
                height: attrs.bodyHeight || '310px',
                'overflow-y': bodyOverflowY_prop
            });

            angular.element(element[0].querySelector('div.box-drag-footer')).css({
                padding: attrs.paddingFooter || '7px 10px'
            });


            var height_header = angular.element(element[0].querySelector('div.box-drag-header')).prop('offsetHeight'),
                // DEPRECATED until further review.
                // height_header_lineheight = angular.element(element[0].querySelector('div.box-drag-header')).css('line-height'),
                height_body = angular.element(element[0].querySelector('div.box-drag-body')).prop('offsetHeight'),
                height_footer = angular.element(element[0].querySelector('div.box-drag-footer')).prop('offsetHeight');

            /*
             * TODO: find a better way to deal with header height.
             * Because 'offsetHeight' fails to get the actual height of the element!
             */
            // height_header_lineheight = parseFloat(height_header_lineheight.replace('px', ''));

            /**
             * In case there is no footer.
             */
            if (height_footer === undefined) { height_footer = 0; }

            /**
             * In case there is no overflow-y set.
             */
            if (bodyOverflowY_prop === 'inherit') {
                height_header_lineheight = 0;
            }

            /**
             * Compute the wrapper height based off the heights of the header, body, and footer divs.
             */
            element.css({ height: height_header + /*height_header_lineheight +*/ height_body + height_footer + 'px' });


            var initialMove = true;

            /**
             * jqLite does not have jQuery's offset (top, left),
             * but this pull request implements this feature for jqLite.
             *
             * https://github.com/angular/angular.js/pull/3799/files
             */
            var jqLiteOffset = function(element) {
                var documentElem,
                    box = { top: 0, left: 0 },
                    doc = element && element.ownerDocument;

                documentElem = doc.documentElement;
                if ( typeof element.getBoundingClientRect !== undefined ) {
                    box = element.getBoundingClientRect();
                }

                return {
                    top: box.top + (window.pageYOffset || documentElem.scrollTop) - (documentElem.clientTop || 0),
                    left: box.left + (window.pageXOffset || documentElem.scrollLeft) - (documentElem.clientLeft || 0),
                    /**
                     * We add an extra return value to be used after mouseup function.
                     */
                    innerTop: box.top
                };
            };

            /**
             * Drag the box.
             */
            var dragAction = function(event) {
                event.preventDefault();

                x = jqLiteOffset(element[0]).left;
                y = jqLiteOffset(element[0]).top;

                startX = event.pageX - x;
                startY = event.pageY - y;

                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            };

            angular.element(element[0].querySelector('div.box-drag-handle')).on('mousedown', dragAction);


            function mousemove(event) {
                element.css({position: 'absolute'});

                y = event.pageY - startY;
                x = event.pageX - startX;

                element.css({
                    top: y + 'px',
                    left: x + 'px'
                });
            }

            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);

                /**
                 * By setting the element back to "fixed", and using the current position
                 * relative to the viewport top, the modal will not get lost while scrolling.
                 */
                element.css({
                    position: 'fixed',
                    top: jqLiteOffset(element[0]).innerTop + 'px'
                });
            }


            /**
             * Remove event-handler and dangling box-drag element from the dom.
             * https://github.com/johnpapa/angular-styleguide#style-y070
             * http://stackoverflow.com/questions/26983696/angularjs-does-destroy-remove-event-listeners
             */
            scope.$on('$destroy', function () {
                angular.element(element[0].querySelector('div.box-drag-handle')).off('mousedown', dragAction);
                element.remove();
            });

        }
    }
})();
