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

            element.css({
                position: 'absolute',
                top: attrs.top || undefined,
                left: attrs.left || undefined,
                bottom: attrs.bottom || '20px',
                right: attrs.right || '20px',
                width: attrs.width || '400px'
            });


            element.find('div.box-drag-header').css({
                padding: attrs.paddingHeader || '7px 10px'
            });

            element.find('div.box-drag-body').css({
                height: attrs.bodyHeight || '310px'
            });

            element.find('div.box-drag-footer').css({
                padding: attrs.paddingFooter || '7px 10px'
            });


            var height_header = element.find('div.box-drag-header').prop('offsetHeight'),
                height_body = element.find('div.box-drag-body').prop('offsetHeight'),
                height_footer = element.find('div.box-drag-footer').prop('offsetHeight');


            var bd_head = element.find('div.box-drag-header').height(),
                bd_footer = element.find('div.box-drag-footer').height();

            /**
             * Compute the wrapper height based off the heights of the header, body, and footer divs.
             */
            element.css({ height: height_header + height_body + height_footer + 'px' });

            var initialMove = true;

            element.find('div.box-drag-handle').on('mousedown', function(event) {
                // Prevent default dragging of selected content
                event.preventDefault();

                /**
                 * This trick is necessary for the first time the modal is moved.
                 * Otherwise, it will move rapidly to the left (not intended behavior).
                 */

                if (initialMove === true) {
                    var elPos = element.position(),
                        elPosLeft = elPos.left,
                        elPosTop = elPos.top;

                    initialMove = false;
                    x = elPosLeft;
                    y = elPosTop;
                }

                startX = event.pageX - x;
                startY = event.pageY - y;

                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                y = event.pageY - startY;
                x = event.pageX - startX;

                element.css({
                    top: y + 'px',
                    left:  x + 'px'
                });
            }

            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
            }
        }
    }
})();
