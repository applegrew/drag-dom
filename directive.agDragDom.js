(function ($) {
	'use strict';
	var app = angular.module('com.applegrew.directive', []);

	var instances = 0;
	var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;;
	app.directive('agDragDom', function ($interval, $timeout, $document) {
		return {
			restrict: 'A',
			link: function ($scope, el, attrs) {
				el = angular.element(el);

				instances++;
				var img;
				if (instances > 1)
					img = $('#agDragDomProxyImg').get(0);
				else
					img = $('<img id="agDragDomProxyImg" src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif"/>').appendTo('body').get(0);
				
				var copy, h, w, lastX, currentX, last2X, last2Y;
				var dirChecker;
				var mouseX, mouseY;
				el.on('dragstart', function (event) {
					if (isFirefox) {
						$document.on("dragover.agDD", function(event){
							mouseX = event.originalEvent.clientX;
							mouseY = event.originalEvent.clientY;
						});
					}
					lastX = -1;
					last2X = [-1, -1];
					last2Y = [-1, -1];
					copy = el.clone().css({
						position: 'absolute',
						display: 'block',
						'z-index': 1000,
						'background-color': el.css('background-color'),
						padding: '5px',
						'box-shadow': '0 0 5px rgba(0, 0, 0, .5)',
						'border-color': el.css('border-color'),
						'transition': 'transform 0.5s ease-out, opacity 1s ease-out',
						'transform-origin': '50% 50%',
						'opacity': 1
					});
					$('body').append(copy);
					h = copy.outerHeight();
					w = copy.outerWidth();
					event.originalEvent.dataTransfer.setDragImage(img, 0, 0);
					dirChecker = $interval(function () {
						if (lastX == -1 || lastX === currentX)
							copy.css("transform", "rotate(0deg)");
						else if (lastX > currentX)
							copy.css("transform", "rotate(8deg)");
						else
							copy.css("transform", "rotate(-8deg)");
						lastX = currentX;
					}, 300);
				});
				el.on('drag', function (event) {
					var y;
					if (isFirefox) {
						currentX = mouseX;
						y = mouseY;
					} else {
						currentX = event.originalEvent.clientX;
						y = event.originalEvent.clientY;
					}

					last2X[1] = last2X[0];
					last2X[0] = currentX - (w / 2);
					
					last2Y[1] = last2Y[0];
					last2Y[0] = y - h - 10 + $(window).scrollTop();

					copy.offset({
						top: last2Y[0],
						left: last2X[0]
					});
				});
				el.on('dragend', function () {
					if (isFirefox)
						$document.off('.agDD');
					$interval.cancel(dirChecker);
					var localCopy = copy;
					localCopy.offset({
						top: last2Y[1],
						left: last2X[1]
					}); // Because just before dragend is fired another drag is fired with invalid x & y (at least on Chrome). And only when the element is dropped on invalid targets.
					localCopy.css('opacity', 0);
					$timeout(function () {
						localCopy.remove();
					}, 1000); // This time should be equal to the time in transition for opacity.
				});
				$scope.$on('$destroy', function () {
					if (instances === 1)
						$(img).remove();
					instances--;
				});
			}
		};
	});
}(jQuery));
