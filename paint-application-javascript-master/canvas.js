$(document).ready(function(){
    
    /*var shape = {
		type: "square",
		x: x,
		y: y,
		width: width,
		height: height,
		selected: false
	  };*/

	var sketch = document.querySelector('#sketch');
	var canvas = document.querySelector('#canvas');
	var tmp_canvas = document.createElement('canvas');
	$('#paint-modal').css('visibility', 'hidden').show();
	canvas.width = $(sketch).width();
	canvas.height = $(sketch).height();
	$('#paint-modal').css('visibility', 'visible').hide();
	tmp_canvas.width = canvas.width;
	tmp_canvas.height = canvas.height;

	var undo_canvas = [];
	var undo_canvas_len = 7;
	for (var i=0; i<undo_canvas_len; ++i) {
		var ucan = document.createElement('canvas');
		ucan.width = canvas.width;
		ucan.height = canvas.height;
		var uctx = ucan.getContext('2d');
		undo_canvas.push({'ucan':ucan, 'uctx':uctx, 'redoable':false});
	}

	var undo_canvas_top = 0; 

	var ctx = canvas.getContext('2d');
	var tmp_ctx = tmp_canvas.getContext('2d');
	tmp_canvas.id = 'tmp_canvas';
	sketch.appendChild(tmp_canvas);

	var mouse = {x: 0, y: 0};
	var start_mouse = {x:0, y:0};
	var eraser_width = 10;
	var fontSize = '14px';
	
	// Pencil Points
	var ppts = [];

	var chosen_size = 2; // by default
	/* Drawing on Paint App */
	tmp_ctx.lineWidth = 3;
	tmp_ctx.lineJoin = 'round';
	tmp_ctx.lineCap = 'round';
	tmp_ctx.strokeStyle = 'black';
	tmp_ctx.fillStyle = 'black';

	//evento de clic al lienzo para determinar si se hizo clic en una figura
	/*canvas.addEventListener("click", function(e) {
		// Obtener las coordenadas del clic
		var mouseX = e.clientX - canvas.getBoundingClientRect().left;
		var mouseY = e.clientY - canvas.getBoundingClientRect().top;
	  
		// Iterar sobre todas las figuras y verificar si se hizo clic en alguna
		for (var i = 0; i < shapes.length; i++) {
		  var shape = shapes[i];
	  
		  if (
			mouseX >= shape.x &&
			mouseX <= shape.x + shape.width &&
			mouseY >= shape.y &&
			mouseY <= shape.y + shape.height
		  ) {
			// Cambiar el estado de selección
			shape.selected = !shape.selected;
			break; // Romper el bucle después de seleccionar una figura
		  }
		}
	  
		// Volver a dibujar todas las figuras en sus estados actualizados
		redraw();
	  });*/

	// paint functions
	var paint_pencil = function(e) {

		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
		//console.log(mouse.x + " "+mouse.y);
		// Saving all the points in an array
		ppts.push({x: mouse.x, y: mouse.y});

		if (ppts.length < 3) {
			var b = ppts[0];
			tmp_ctx.beginPath();
			//ctx.moveTo(b.x, b.y);
			//ctx.lineTo(b.x+50, b.y+50);
			tmp_ctx.arc(b.x, b.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
			tmp_ctx.fill();
			tmp_ctx.closePath();
			return;
		}
		
		// Tmp canvas is always cleared up before drawing.
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		
		tmp_ctx.beginPath();
		tmp_ctx.moveTo(ppts[0].x, ppts[0].y);
		
		for (var i = 0; i < ppts.length; i++) 
			tmp_ctx.lineTo(ppts[i].x, ppts[i].y);
		
		tmp_ctx.stroke();
		
	};

    //MOVIMIENTO Y SELECCION DE FIGURA
    /*canvas.addEventListener("mousemove", function(e) {
		// Verificar si se está arrastrando alguna figura
		if (dragging) {
		  // Actualizar las coordenadas de las figuras seleccionadas
		  for (var i = 0; i < shapes.length; i++) {
			var shape = shapes[i];
			if (shape.selected) {
			  shape.x += e.clientX - lastX;
			  shape.y += e.clientY - lastY;
			}
		  }
	  
		  // Volver a dibujar todas las figuras en sus posiciones actualizadas
		  redraw();
	  
		  // Actualizar las últimas coordenadas del ratón
		  lastX = e.clientX;
		  lastY = e.clientY;
		}
	  });
	  
	  canvas.addEventListener("mousedown", function(e) {
		// Verificar si se hizo clic en una figura seleccionada
		for (var i = 0; i < shapes.length; i++) {
		  var shape = shapes[i];
		  if (shape.selected) {
			dragging = true;
			lastX = e.clientX;
			lastY = e.clientY;
			break;
		  }
		}
	  });
	  
	  canvas.addEventListener("mouseup", function() {
		// Detener el arrastre al soltar el botón del ratón
		dragging = false;
	  });*/

	//DIBUJAR LINEA
	var paint_line = function(e) {

		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;	
		// Tmp canvas is always cleared up before drawing.
    	tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
 
    	tmp_ctx.beginPath();
    	tmp_ctx.moveTo(start_mouse.x, start_mouse.y);
    	tmp_ctx.lineTo(mouse.x, mouse.y);
    	tmp_ctx.stroke();
    	tmp_ctx.closePath();
	}

	var paint_square = function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;	
		// Tmp canvas is always cleared up before drawing.
    	tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
 		tmp_ctx.beginPath();
    	tmp_ctx.moveTo(start_mouse.x, start_mouse.y);

		var x = Math.min(mouse.x, start_mouse.x);
		var y = Math.min(mouse.y, start_mouse.y);
		var width = Math.abs(mouse.x - start_mouse.x);
		var height = Math.abs(mouse.y - start_mouse.y);
		tmp_ctx.strokeRect(x, y, width, height);
		tmp_ctx.closePath();
	}

	var paint_circle = function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;	
		// Tmp canvas is always cleared up before drawing.
    	tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
 
    	var x = (mouse.x + start_mouse.x) / 2;
    	var y = (mouse.y + start_mouse.y) / 2;
 
    	//var radius = Math.max(Math.abs(mouse.x - start_mouse.x), Math.abs(mouse.y - start_mouse.y)) / 2;
    	var a = mouse.x - start_mouse.x;
    	var b = mouse.y - start_mouse.y;
    	var r = Math.sqrt(a*a + b*b);
 
	    tmp_ctx.beginPath();
    	//tmp_ctx.arc(x, y, radius, 0, Math.PI*2, false);
    	tmp_ctx.arc(start_mouse.x, start_mouse.y, r, 0, 2*Math.PI);
    	// tmp_ctx.arc(x, y, 5, 0, Math.PI*2, false);
    	tmp_ctx.stroke();
    	tmp_ctx.closePath();
	}

	var paint_ellipse = function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;	
		// Tmp canvas is always cleared up before drawing.
    	tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
 
    	var x = start_mouse.x;
    	var y = start_mouse.y;
    	var w = (mouse.x - x);
    	var h = (mouse.y - y);
 		
  		tmp_ctx.save(); // save state
        tmp_ctx.beginPath();

        tmp_ctx.translate(x, y);
        tmp_ctx.scale(w/2, h/2);
        tmp_ctx.arc(1, 1, 1, 0, 2 * Math.PI, false);

        tmp_ctx.restore(); // restore to original state
        tmp_ctx.stroke();
        tmp_ctx.closePath();

	}

	var paint_right_triangle = function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
	
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
	
		var x = start_mouse.x;
		var y = start_mouse.y;
		var w = mouse.x - x;
		var h = mouse.y - y;
	
		tmp_ctx.save(); // save state
		tmp_ctx.beginPath();
	
		// Move to the top-left corner
		tmp_ctx.moveTo(x, y);
	
		// Line to the bottom-left corner
		tmp_ctx.lineTo(x, y + h);
	
		// Line to the bottom-right corner
		tmp_ctx.lineTo(x + w, y + h);
	
		// Line back to the top-left corner (closing the triangle)
		tmp_ctx.lineTo(x, y);
	    
		tmp_ctx.restore();
		tmp_ctx.stroke();
		tmp_ctx.closePath();
	}

	var paint_rounded_rectangle = function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
	
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
	
		var x = start_mouse.x;
		var y = start_mouse.y;
		var w = mouse.x - x;
		var h = mouse.y - y;
		var cornerRadius = 20; // Ajusta el radio de las esquinas según sea necesario
	
		tmp_ctx.save(); // save state
		tmp_ctx.beginPath();
	
		tmp_ctx.moveTo(x + cornerRadius, y);
		tmp_ctx.lineTo(x + w - cornerRadius, y);
		tmp_ctx.quadraticCurveTo(x + w, y, x + w, y + cornerRadius);
		tmp_ctx.lineTo(x + w, y + h - cornerRadius);
		tmp_ctx.quadraticCurveTo(x + w, y + h, x + w - cornerRadius, y + h);
		tmp_ctx.lineTo(x + cornerRadius, y + h);
		tmp_ctx.quadraticCurveTo(x, y + h, x, y + h - cornerRadius);
		tmp_ctx.lineTo(x, y + cornerRadius);
		tmp_ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
	
		tmp_ctx.stroke();
		tmp_ctx.closePath();
		tmp_ctx.restore(); // restore to original state
	}

	var paint_triangle = function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
	
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
	
		var x = start_mouse.x;
		var y = start_mouse.y;
		var w = mouse.x - x;
		var h = mouse.y - y;
	
		tmp_ctx.save(); // save state
		tmp_ctx.beginPath();
	
		// Mueve al vértice superior del triángulo
		tmp_ctx.moveTo(x + w / 2, y);
	
		// Línea al vértice inferior izquierdo
		tmp_ctx.lineTo(x, y + h);
	
		// Línea al vértice inferior derecho
		tmp_ctx.lineTo(x + w, y + h);
	
		// Línea de vuelta al vértice superior (cierra el triángulo)
		tmp_ctx.lineTo(x + w / 2, y);
	
		tmp_ctx.stroke();
		tmp_ctx.closePath();
		tmp_ctx.restore(); // restaura al estado original
	}
 //dibujar rombo
	var paint_diamond = function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
	
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
	
		var x = start_mouse.x;
		var y = start_mouse.y;
		var w = mouse.x - x;
		var h = mouse.y - y;
	
		tmp_ctx.save(); // guarda el estado
		tmp_ctx.beginPath();
	
		// Mueve al vértice superior del rombo
		tmp_ctx.moveTo(x + w / 2, y);
	
		// Línea al vértice izquierdo medio
		tmp_ctx.lineTo(x, y + h / 2);
	
		// Línea al vértice inferior medio
		tmp_ctx.lineTo(x + w / 2, y + h);
	
		// Línea al vértice derecho medio
		tmp_ctx.lineTo(x + w, y + h / 2);
	
		// Línea de vuelta al vértice superior (cierra el rombo)
		tmp_ctx.lineTo(x + w / 2, y);
	
		tmp_ctx.stroke();
		tmp_ctx.closePath();
		tmp_ctx.restore(); // restaura al estado original
	};

	// Función para dibujar un trapecio isósceles
var paint_trapezoid = function(e) {
    mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
    mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;

    tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

    var x = start_mouse.x;
    var y = start_mouse.y;
    var w = mouse.x - x;
    var h = mouse.y - y;
    
    var baseWidth = Math.abs(w);
    var topWidth = baseWidth * 0.7; // Ancho de la parte superior del trapecio, ajusta según sea necesario

    tmp_ctx.save(); // Guarda el estado
    tmp_ctx.beginPath();

    // Mueve al vértice superior izquierdo del trapecio
    tmp_ctx.moveTo(x + (baseWidth - topWidth) / 2, y);

    // Línea al vértice superior derecho del trapecio
    tmp_ctx.lineTo(x + (baseWidth + topWidth) / 2, y);

    // Línea a la base inferior derecha del trapecio
    tmp_ctx.lineTo(x + w, y + h);

    // Línea a la base inferior izquierda del trapecio
    tmp_ctx.lineTo(x, y + h);

    // Línea de vuelta al vértice superior izquierdo (cierra el trapecio)
    tmp_ctx.lineTo(x + (baseWidth - topWidth) / 2, y);

    tmp_ctx.stroke();
    tmp_ctx.closePath();
    tmp_ctx.restore(); // Restaura al estado original
};

	//dibujar poligono
    var paint_polygon = function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
	
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
	
		var x = start_mouse.x;
		var y = start_mouse.y;
	
		tmp_ctx.save(); // guarda el estado
		tmp_ctx.beginPath();
	
		// Mueve al primer punto del polígono
		tmp_ctx.moveTo(x, y);
	
		// Calcula la distancia entre los puntos para determinar cuántos segmentos dibujar
		var distance = Math.sqrt(Math.pow(mouse.x - x, 2) + Math.pow(mouse.y - y, 2));
		var segments = Math.ceil(distance / 10); // ajusta el valor 10 según tus necesidades
	
		// Dibuja segmentos entre los puntos
		for (var i = 1; i <= segments; i++) {
			var xSegment = x + (i / segments) * (mouse.x - x);
			var ySegment = y + (i / segments) * (mouse.y - y);
			tmp_ctx.lineTo(xSegment, ySegment);
		}
	
		tmp_ctx.stroke();
		tmp_ctx.closePath();
		tmp_ctx.restore(); // restaura al estado original
	};

	var move_eraser = function(e){
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;	
		// Tmp canvas is always cleared up before drawing.
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		var tmp_lw = tmp_ctx.lineWidth;
		var tmp_ss = tmp_ctx.strokeStyle;
		tmp_ctx.lineWidth = 1;
		tmp_ctx.strokeStyle = 'black';
		tmp_ctx.beginPath();
    	tmp_ctx.strokeRect(mouse.x, mouse.y, eraser_width, eraser_width);
    	tmp_ctx.stroke();
    	tmp_ctx.closePath();
    	// restore linewidth
    	tmp_ctx.lineWidth = tmp_lw;
    	tmp_ctx.strokeStyle = tmp_ss;
	}

	var paint_text = function(e) {
		// Tmp canvas is always cleared up before drawing.
    	tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
     	mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;	

    	var x = Math.min(mouse.x, start_mouse.x);
    	var y = Math.min(mouse.y, start_mouse.y);
    	var width = Math.abs(mouse.x - start_mouse.x);
    	var height = Math.abs(mouse.y - start_mouse.y);
     
    	textarea.style.left = x + 'px';
    	textarea.style.top = y + 'px';
    	textarea.style.width = width + 'px';
    	textarea.style.height = height + 'px';
     
    	textarea.style.display = 'block';
	}

	var paint_eraser = function(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;	
		// erase from the main ctx
    	ctx.clearRect(mouse.x, mouse.y, eraser_width, eraser_width);
	}
    
	
	// Choose tool
	tool = 'pencil';
	tools_func = {'pencil':paint_pencil, 'line':paint_line, 'square':paint_square, 
					'circle':paint_circle, 'ellipse':paint_ellipse, 'right-triangle': paint_right_triangle, 'triangle':paint_triangle,
					'rounded-rectangle' : paint_rounded_rectangle, 'diamond': paint_diamond, 'isosceles-trapezoid': paint_trapezoid, 'polygon': paint_polygon, 'eraser':paint_eraser,
					'text':paint_text};

	$('#paint-panel').on('click', function(event){
		// remove the mouse down eventlistener if any
		tmp_canvas.removeEventListener('mousemove', tools_func[tool], false);

		var target = event.target,
			tagName = target.tagName.toLowerCase();
		
		if(target && tagName != 'button'){
			target = target.parentNode;
        	tagName = target.tagName.toLowerCase();
		}

		if(target && tagName === 'button'){
			tool = $(target).data('divbtn');

			if (tool === 'eraser') {
				tmp_canvas.addEventListener('mousemove', move_eraser, false);
				$(tmp_canvas).css('cursor', 'none');
			}
			else {
				tmp_canvas.removeEventListener('mousemove', move_eraser, false);	
				$(tmp_canvas).css('cursor', 'crosshair');
				tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
			}
		}
	});

	function selectFigure(e) {
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
	
		// Itera sobre todas las figuras dibujadas y verifica si el mouse está dentro de alguna
		for (var i = 0; i < figures.length; i++) {
			var figure = figures[i];
	
			// Verifica si el mouse está dentro de las coordenadas de la figura
			if (
				mouse.x >= figure.x &&
				mouse.x <= figure.x + figure.width &&
				mouse.y >= figure.y &&
				mouse.y <= figure.y + figure.height
			) {
				// La figura está seleccionada, puedes realizar acciones adicionales aquí
				console.log('Figura seleccionada:', figure);
				break; // Puedes detener el bucle si solo quieres seleccionar una figura
			}
		}
	}
	
	// Change color
	$('#color-panel').on('click', function(event){
		// remove the mouse down eventlistener if any
		tmp_canvas.removeEventListener('mousemove', tools_func[tool], false);

		var target = event.target,
			tagName = target.tagName.toLowerCase();
		
		if(target && tagName != 'button'){
			target = target.parentNode;
        	tagName = target.tagName.toLowerCase();
		}

		if(target && tagName === 'button'){
			tmp_ctx.strokeStyle =  $(target).data('color');
			tmp_ctx.fillStyle =  $(target).data('color');
		}
	});

	

	// Mouse-Down 
	tmp_canvas.addEventListener('mousedown', function(e) {
		
		mouse.x = typeof e.offsetX !== 'undefined' ? e.offsetX : e.layerX;
		mouse.y = typeof e.offsetY !== 'undefined' ? e.offsetY : e.layerY;
		start_mouse.x = mouse.x;
    	start_mouse.y = mouse.y;	
    	tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

		if (tool === 'pencil') {
			tmp_canvas.addEventListener('mousemove', paint_pencil, false);
			ppts.push({x: mouse.x, y: mouse.y});
			paint_pencil(e);
		}
		
		if (tool === 'line') {
			tmp_canvas.addEventListener('mousemove', paint_line, false);
    	}

		if (tool === 'square') {
			tmp_canvas.addEventListener('mousemove', paint_square, false);	
		}
		
		if (tool === 'circle') {
			tmp_canvas.addEventListener('mousemove', paint_circle, false);
    		// Mark the center
    		
    		tmp_ctx.beginPath();
			//ctx.moveTo(b.x, b.y);
			//ctx.lineTo(b.x+50, b.y+50);
			tmp_ctx.arc(start_mouse.x, start_mouse.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2, !0);
			tmp_ctx.fill();
			tmp_ctx.closePath();
			// copy to real canvas
			ctx.drawImage(tmp_canvas, 0, 0);	
		}

		if (tool === 'ellipse') {
			tmp_canvas.addEventListener('mousemove', paint_ellipse, false);
    	}

		if (tool === 'right-triangle') {
			tmp_canvas.addEventListener('mousemove', paint_right_triangle, false);
    	}

        if (tool === 'rounded-rectangle') {
			tmp_canvas.addEventListener('mousemove', paint_rounded_rectangle, false);
    	}

		if (tool === 'triangle') {
			tmp_canvas.addEventListener('mousemove', paint_triangle, false);
    	}

		if (tool === 'diamond') {
			tmp_canvas.addEventListener('mousemove', paint_diamond, false);
    	}

		if (tool === 'isosceles-trapezoid') {
			tmp_canvas.addEventListener('mousemove', paint_trapezoid, false);
    	}

		if (tool === 'polygon') {
			tmp_canvas.addEventListener('mousemove', paint_polygon, false);
    	}

    	if (tool === 'text') {
    		tmp_canvas.addEventListener('mousemove', paint_text, false);
    		textarea.style.display = 'none'; // important to hide when clicked outside
    	}

		if (tool === 'select-shape') {
    		tmp_canvas.addEventListener('mousemove', selectFigure, false);
    	}

    	if (tool === 'eraser') {
    		tmp_canvas.addEventListener('mousemove', paint_eraser, false);
    		// erase from the main ctx
    		ctx.clearRect(mouse.x, mouse.y, eraser_width, eraser_width);		
    	}

    	if (tool === 'fill') {
    		var replacement_color = hex_to_color(tmp_ctx.strokeStyle);
    		//console.log(tmp_ctx.strokeStyle);	
    		var red_component = {'red':255, 'lime':0, 'blue':0, 'orange':255, 'yellow':255, 'magenta':255, 
						'cyan':0, 'purple':128, 'brown':165, 'gray':128, 'lavender':230, 
						'white':255, 'black':0};
			var green_component = {'red':0, 'lime':255, 'blue':0, 'orange':165, 'yellow':255, 'magenta':0, 
						'cyan':255, 'purple':0, 'brown':42, 'gray':128, 'lavender':230, 
						'white':255, 'black':0};
			var blue_component = {'red':0, 'lime':0, 'blue':255, 'orange':0, 'yellow':0, 'magenta':255, 
						'cyan':255, 'purple':128, 'brown':42, 'gray':128, 'lavender':250, 
						'white':255, 'black':0};												

    		var replace_r = red_component[replacement_color];
    		var replace_g = green_component[replacement_color];
    		var replace_b = blue_component[replacement_color];

    		var imgd = ctx.getImageData(0, 0, canvas.width, canvas.height);
			var pix = imgd.data;
			// pix is row-wise straightened array
			var pos = 4 * (canvas.width * mouse.y + mouse.x);
			var target_color = map_to_color(pix[pos],pix[pos+1],pix[pos+2],pix[pos+3]);
			
			// start the flood fill algorithm
			if (replacement_color !== target_color) {
				var Q = [pos];
				while (Q.length > 0) {
					pos = Q.shift();
					if (map_to_color(pix[pos],pix[pos+1],pix[pos+2],pix[pos+3]) !== target_color)
						continue; // color is already changed

					var left = find_left_most_similar_pixel(pix, pos, target_color);
					var right = find_right_most_similar_pixel(pix, pos, target_color);
					// replace color
					//console.log('right: '+ (right/4)%canvas.width + ' '+ Math.floor(right/(4*canvas.width))  );
					//console.log(j+'. '+(right-left));
					for (var i=left; i<=right; i=i+4) {
						pix[i] = replace_r;
						pix[i+1] = replace_g;
						pix[i+2] = replace_b;
						pix[i+3] = 255; // not transparent

						var top = i - 4*canvas.width;
						var down = i + 4*canvas.width;

						if (top >= 0 && map_to_color(pix[top], pix[top+1], pix[top+2], pix[top+3]) === target_color) 
							Q.push(top); 

						if (down < pix.length && map_to_color(pix[down], pix[down+1],pix[down+2],pix[down+3]) === target_color)
							Q.push(down);
					}
					
				}	
				
				// Draw the ImageData at the given (x,y) coordinates.
				ctx.putImageData(imgd, 0, 0);	
					
			}

			
    	}
		
	}, false);
		
	// for filling	
	var find_left_most_similar_pixel = function(pix, pos, target_color) {
		var y = Math.floor(pos/(4*canvas.width));
		var left = pos;
		var end = y * canvas.width * 4;
		while (end < left) {
			if (map_to_color(pix[left-4],pix[left-3],pix[left-2],pix[left-1]) === target_color)
				left = left - 4;
			else
				break;
		}
		return left;
	}

	var find_right_most_similar_pixel = function(pix, pos, target_color) {
		var y = Math.floor(pos/(4*canvas.width));
		var right = pos;
		var end = (y+1) * canvas.width * 4 - 4;
		while (end > right) {
			if (map_to_color(pix[right+4],pix[right+5],pix[right+6],pix[right+7]) === target_color)
				right = right + 4;
			else
				break;
		}
		return right;
	}

	var hex_to_color = function(hex) {
	    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        	return r + r + g + g + b + b;
    		});

    	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    	var r = parseInt(result[1], 16),
            g = parseInt(result[2], 16),
            b = parseInt(result[3], 16);
    	
		return map_to_color(r, g, b, 255);
	}

	var map_to_color = function(r,g,b,a) {
		if (a === 0)
			return 'white';
		else {
			if (r===255 && g===0 && b===0)
				return 'red';
			if (r===0 && g===255 && b===0)
				return 'lime';
			if (r===0 && g===0 && b===255)
				return 'blue';
			if (r===255 && g===255 && b===0)
				return 'yellow';
			if (r===255 && g===0 && b===255)
				return 'magenta';
			if (r===0 && g===255 && b===255)
				return 'cyan';
			if (r===255 && g===165 && b===0)
				return 'orange';
			if (r===128 && g===0 && b===128)
				return 'purple';
			if (r===128 && g===128 && b===128)
				return 'gray';
			if (r===0 && g===0 && b===0)
				return 'black';
			if (r===230 && g===230 && b===250)
				return 'lavender';
			if (r===165 && g===42 && b===42)
				return 'brown';
		}

		return 'white';
	}

	// text-tool
	var textarea = document.createElement('textarea');
	textarea.id = 'text_tool';
	sketch.appendChild(textarea);


	textarea.addEventListener('mouseup', function(e) {
		tmp_canvas.removeEventListener('mousemove', paint_text, false);
	}, false);

	// set the color
	textarea.addEventListener('mousedown', function(e){
		textarea.style.color = tmp_ctx.strokeStyle;
		textarea.style['font-size'] = fontSize;
	}, false);
	

	textarea.addEventListener('blur', function(e) {
		var lines = textarea.value.split('\n');
			var ta_comp_style = getComputedStyle(textarea);
    		var fs = ta_comp_style.getPropertyValue('font-size');
    		
    		var ff = ta_comp_style.getPropertyValue('font-family');
    
    		tmp_ctx.font = fs + ' ' + ff;
    		tmp_ctx.textBaseline = 'hanging';
     
    		for (var n = 0; n < lines.length; n++) {
        		var line = lines[n];
         
        		tmp_ctx.fillText(
            		line,
            		parseInt(textarea.style.left),
            		parseInt(textarea.style.top) + n*parseInt(fs)
        		);    		
    		}
     
    		// Writing down to real canvas now
    		ctx.drawImage(tmp_canvas, 0, 0);
    		textarea.style.display = 'none';
    		textarea.value = '';
    		// Clearing tmp canvas
			tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);

			// keep the image in the undo_canvas
			undo_canvas_top = next_undo_canvas(undo_canvas_top);
			var uctx = undo_canvas[undo_canvas_top]['uctx'];
			uctx.clearRect(0, 0, canvas.width, canvas.height);
			uctx.drawImage(canvas, 0, 0);
			undo_canvas[undo_canvas_top]['redoable'] = false;
	});

	tmp_canvas.addEventListener('mouseup', function() {
		tmp_canvas.removeEventListener('mousemove', tools_func[tool], false);
		
		// Writing down to real canvas now
		// text-tool is managed when textarea.blur() event
		if (tool !='text') {
			ctx.drawImage(tmp_canvas, 0, 0);
			// keep the image in the undo_canvas
			undo_canvas_top = next_undo_canvas(undo_canvas_top);
			var uctx = undo_canvas[undo_canvas_top]['uctx'];
			uctx.clearRect(0, 0, canvas.width, canvas.height);
			uctx.drawImage(canvas, 0, 0);
			undo_canvas[undo_canvas_top]['redoable'] = false;
		}


		// Clearing tmp canvas
		tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		
		// Emptying up Pencil Points
		ppts = [];
	}, false);
	
	var next_undo_canvas = function(top) {
		if (top === undo_canvas_len-1)
			return 0;
		else
			return top+1;
	}

	var prev_undo_canvas = function(top) {
		if (top === 0) 
			return undo_canvas_len-1;
		else
			return  top-1;
	}

	// clear paint area
	$('#paint-clear').click(function(){
		ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
		// keep the image in the undo_canvas
		undo_canvas_top = next_undo_canvas(undo_canvas_top);
		var uctx = undo_canvas[undo_canvas_top]['uctx'];
		uctx.clearRect(0, 0, canvas.width, canvas.height);
		uctx.drawImage(canvas, 0, 0);
		undo_canvas[undo_canvas_top]['redoable'] = false;
	});


	// Change Size
	$('#choose-size .radio-group').on('click', function(){
		var s = $('input[name=size]:checked', '#choose-size').val();
		if (s==='1') {
			tmp_ctx.lineWidth = 1;
			eraser_width = 5;
			fontSize = '10px';
		}
		if (s==='2') {
			tmp_ctx.lineWidth = 3;
			eraser_width = 10;
			fontSize = '14px';
		}
		if (s==='3') {
			tmp_ctx.lineWidth = 6;
			eraser_width = 15;
			fontSize = '18px';
		}
		if (s==='4') {
			tmp_ctx.lineWidth = 10;
			eraser_width = 20;
			fontSize = '22px';
		}
	});

	// undo-redo tools
	$('#undo-tool').on('click', function(){
		var prev = prev_undo_canvas(undo_canvas_top);
		if (!undo_canvas[prev].redoable) {
			console.log(undo_canvas_top+' prev='+prev);
			var ucan = undo_canvas[prev]['ucan'];
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(ucan, 0, 0);
			undo_canvas[undo_canvas_top].redoable = true;
			undo_canvas_top = prev;
		}
	});
	
	$('#redo-tool').on('click', function(){
		var next = next_undo_canvas(undo_canvas_top);
		if (undo_canvas[next].redoable) {
			console.log(undo_canvas_top);
			var ucan = undo_canvas[next]['ucan'];
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(ucan, 0, 0);
			undo_canvas[next].redoable = false;
			undo_canvas_top = next;
		}
	});

});