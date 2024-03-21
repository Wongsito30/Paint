$(document).ready(function(){
    var sketch = document.querySelector('#sketch');
	var canvas = document.querySelector('#canvas');
	var tmp_canvas = document.createElement('canvas');
	var fileInput = document.getElementById('file-input');
	var capas = [];

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
    var img = null; // Variable para almacenar la imagen cargada
    var offsetX, offsetY; // Variables para almacenar el desplazamiento

// Función para cargar una imagen en el lienzo
var loadImage = function(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
        img = new Image();
        img.onload = function() {
            // Dibujar la imagen en el lienzo cuando se carga completamente
            tmp_ctx.drawImage(img, 0, 0);
        };
        img.src = e.target.result;
    };
    // Leer el archivo como una URL de datos
    reader.readAsDataURL(file);
};

// Función para mover la imagen
var moveImage = function(e) {
    var rect = tmp_canvas.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;
    if (img !== null) {
        tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
        tmp_ctx.drawImage(img, mouseX - offsetX, mouseY - offsetY);
    }
};

// Manejador de eventos para el cambio en el input de tipo archivo
var handleFileInputChange = function(e) {
    var file = e.target.files[0];
    if (file) {
        loadImage(file);
    }
};

// Asignar el evento de cambio de archivo al input de tipo archivo
var fileInput = document.getElementById('file-input'); // Debes tener un elemento input de tipo file en tu HTML con el id "fileInput"
fileInput.addEventListener('change', handleFileInputChange);

// Manejadores de eventos para el movimiento de la imagen
tmp_canvas.addEventListener('mousedown', function(e) {
    if (img !== null) {
        var rect = tmp_canvas.getBoundingClientRect();
        var mouseX = e.clientX - rect.left;
        var mouseY = e.clientY - rect.top;
        offsetX = mouseX - img.x;
        offsetY = mouseY - img.y;
        tmp_canvas.addEventListener('mousemove', moveImage);
    }
});

tmp_canvas.addEventListener('mouseup', function() {
    tmp_canvas.removeEventListener('mousemove', moveImage);
});

//Variable que almacena el angulo de rotacion
var rotationAngle = 0
// funcion que rota la imagen
var rotateImage = function(e) {
    var rect = tmp_canvas.getBoundingClientRect();
    var mouseX = e.clientX - rect.left;
    var mouseY = e.clientY - rect.top;
    if (img !== null) {
        tmp_ctx.clearRect(0, 0, tmp_canvas.width, tmp_canvas.height);
        
        // Rotar la imagen
        tmp_ctx.translate(mouseX, mouseY);
        tmp_ctx.rotate(rotationAngle * Math.PI / 180);
        tmp_ctx.drawImage(img, -img.width/2, -img.height/2);
        tmp_ctx.rotate(-rotationAngle * Math.PI / 180);
        tmp_ctx.translate(-mouseX, -mouseY);
    }
};

//funciones que rotan la imagen en izquierda o derecha
var rotateLeft = function() {
    rotationAngle -= 90;
    if (rotationAngle < 0) {
        rotationAngle += 360;
    }
    rotateImage({ clientX: tmp_canvas.width / 2, clientY: tmp_canvas.height / 2 }); // Centrar la rotación en el centro del lienzo
};

var rotateRight = function() {
    rotationAngle += 90;
    rotationAngle %= 360;
    rotateImage({ clientX: tmp_canvas.width / 2, clientY: tmp_canvas.height / 2 }); // Centrar la rotación en el centro del lienzo
};

document.getElementById('rotate-left-btn').addEventListener('click', rotateLeft); // Rotar a la izquierda
document.getElementById('rotate-right-btn').addEventListener('click', rotateRight); // Rotar a la derecha

var isResizing = false;
var initialX, initialY;
var originalWidth, originalHeight;

document.addEventListener('mousedown', function(event) {
    isResizing = true;
    initialX = event.offsetX;
    initialY = event.offsetY;
    originalWidth = canvas.width;
    originalHeight = canvas.height;
});

document.addEventListener('mousemove', function(event) {
    if(isResizing) {
        var dx = event.offsetX - initialX;
        var dy = event.offsetY - initialY;

        canvas.width = originalWidth + dx;
        canvas.height = originalHeight + dy;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
});

document.addEventListener('mouseup', function() {
    isResizing = false;
});

});