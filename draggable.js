void function ( $, _ ) {

	var x, y,
		deltaX, deltaY,
		offsetX, offsetY,
		distance, direction,
		velocityX, velocityY,
		timeStart, timeStop, timeOffset,
		axis, foundAxis,
		event, target,
		tapped, dragging,
		isTouchDevice, now,
		DRAG_DATA;

	$(window).one('touchstart', function ( e ) {
		isTouchDevice = true;
	})
	$(document).ready(function () {

		bindEvent(document.body, 'touchstart', tap);
		bindEvent(document.body, 'touchmove', drag);
		bindEvent(document.body, 'touchend', release);
		bindEvent(document.body, 'touchcancel', release);

		bindEvent(document.body, 'mousedown', tap);
		bindEvent(document.body, 'mousemove', drag);
		bindEvent(document.body, 'mouseup', release);
		bindEvent(document.body, 'blur', release);

		$(window).on('mouseout', function ( e ) {
			e.toElement || release(e);
		});
	})

	function tap ( e ) {
		if (e.target.classList.contains('jsn-es-draggable')) {
			target = $(e.target);
		}
		else {
			var parent = findParentNode(e.target);
			if (parent) {
				target = $(parent);
			}
			else {
				return;
			}
		}

		if ( tapped )
			return;

		now = timeStart = Date.now();
		DRAG_DATA = {};

		switch ( e.type ) {
			case 'mousedown':
				if (isTouchDevice)
					return;
				x = e.pageX;
				y = e.pageY;
				e.preventDefault();
				break;
			case 'touchstart':
				if ( e.touches.length != 1 )
					return;
				x = e.touches[ 0 ].clientX;
				y = e.touches[ 0 ].clientY;
				break;
		}
		deltaX = 0;
		deltaY = 0;
		offsetX = 0;
		offsetY = 0;
		foundAxis = null;
		distance = 0;
		direction = 'none';
		axis = 'none';

		tapped = true;
	}

	function drag ( e ) {
		if (!tapped)
			return;
		switch ( e.type ) {
			case 'mousemove':
				if (isTouchDevice)
					return;
				var pageX = e.pageX;
				var pageY = e.pageY;
				e.preventDefault();
				break;
			case 'touchmove':
				if ( e.touches.length != 1 )
					return;
				var pageX = e.touches[ 0 ].clientX;
				var pageY = e.touches[ 0 ].clientY;
				break;
		}
		now = Date.now();

		deltaX = pageX - x;
		deltaY = pageY - y;
		offsetX += deltaX;
		offsetY += deltaY;
		x = pageX;
		y = pageY;

		if ( !foundAxis ) {
			if ( Math.abs(offsetX) > Math.abs(offsetY) ) {
				axis = 'x';
			}
			else if ( Math.abs(offsetX) < Math.abs(offsetY) ) {
				axis = 'y';
			}
			else {
				axis = 'none';
			}
			distance = Math.max(Math.abs(offsetX), Math.abs(offsetY));
			if ( distance > 50 )
				foundAxis = true;
		}
		Math.abs(deltaX) >= Math.abs(deltaY) ?
			direction = deltaX > 0 ? 'right' : deltaX < 0 ? 'left' : 'none' :
			direction = deltaY > 0 ? 'down' : deltaY < 0 ? 'up' : 'none';

		if ( !dragging ) {
			dragging = true;

			target.trigger(createEvent('es_dragstart', e ), getData());
			$('body').add(target).addClass('jsn-es-draggable-dragging');
		}
		if ( dragging ) {

			timeStop = Date.now();
			calculateVelocity();
			timeStart = Date.now();
			target.trigger(createEvent('es_dragmove', e ), getData());
		}
	}

	function release ( e ) {
		if ( !tapped )
			return;
		switch ( e.type ) {
			case 'touchend':
			case 'touchcancel':
				if ( e.touches.length )
					return;
		}
		tapped = false;

		if ( !dragging )
			return

		timeStop = Date.now();
		calculateVelocity();

		dragging = false;
		$('body').add(target).removeClass('jsn-es-draggable-dragging');
		target.trigger(createEvent('es_dragstop', e), getData());
		target.removeData('jsn-es-draggable-data');
	}

	function calculateVelocity() {
		timeOffset = timeStop - timeStart;
		velocityX = Math.abs(deltaX / timeOffset);
		velocityY = Math.abs(deltaY / timeOffset);
	}
	function getData () {
		var data = DRAG_DATA;
		data.direction = direction;
		data.axis = axis;
		data.deltaX = deltaX;
		data.deltaY = deltaY;
		data.moveX = offsetX;
		data.moveY = offsetY;
		data.velocityX = velocityX;
		data.velocityY = velocityY;

		DRAG_DATA = data;

		return data;
	}
	function bindEvent( element, event, handler, capture) {
		if (element.addEventListener)
			return element.addEventListener(event,handler,capture);
		if (element.attachEvent)
			return element.attachEvent(event,handler,capture);
	}
	function createEvent( type, e ) {
		var options = {};
		options.originalEvent = e;
		options.preventDefault = _.bind(e.preventDefault, e);
		options.stopPropagation = _.bind(e.stopPropagation, e);
		return $.Event(type, options)
	}
	function findParentNode( child ) {
		var parent = child.parentNode, found = null;

		while (parent && !found && !parent.isEqualNode(document.body))
			parent.classList && parent.classList.contains('jsn-es-draggable') ?
				found = parent:
				parent = parent.parentNode;

		return found;
	}

}(jQuery, _ )