// otra manera de hacer el querySelector con tipado, para no tener que escribir tanto
const $ = <A extends HTMLElement>(selector: string): A | null => document.querySelector(selector);

window.onload = function () {
  const addColumn = $<HTMLButtonElement>('#addColumn');
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;

  if (addColumn) {
    addColumn.onclick = () => añadirColumna();
  }

  // Buscador
  if (!searchInput) {
    return;
  }
  searchInput.addEventListener('input', function () {
    const texto = searchInput.value.toLowerCase();
    document.querySelectorAll('.tarea').forEach((tarea) => {
      if (!tarea.querySelector('input')) return;
      const input = tarea.querySelector('input') as HTMLInputElement;
      const contenido = searchInput.value.toLowerCase();
      (tarea as HTMLElement).style.display = contenido.includes(texto) ? 'block' : 'none';
    });
  });

  const btnMenu = document.getElementById('filter');
  if (btnMenu) {
    btnMenu.addEventListener('click', toggleMenu);
  }
  cargarEstado();
  actualizarContadores();

  // si encuentra el ID le añade el evento, si no, no hace nada
  document.getElementById('btn-design')?.addEventListener('click', () => filtrarPorTipo('DESIGN'));
  document.getElementById('btn-urgent')?.addEventListener('click', () => filtrarPorTipo('URGENT'));
  document.getElementById('btn-bug')?.addEventListener('click', () => filtrarPorTipo('BUG'));
  document.getElementById('btn-all')?.addEventListener('click', () => filtrarPorTipo('ALL'));
};

// Evento filtro

// para mostrar y ocultar el menu
function toggleMenu() {
  const menu = document.getElementById('filterMenu');
  if (!menu) return;
  menu.classList.toggle('hidden');
}

function filtrarPorTipo(tipo: string) {
  document.querySelectorAll<HTMLElement>('.tarea').forEach((tarea) => {
    // comprobar de que tipo es la tarea
    const tipoTarea = tarea.dataset.tipo || '';
    if (tipo === 'ALL' || tipoTarea === tipo) {
      (tarea as HTMLElement).style.display = 'block';
    } else {
      (tarea as HTMLElement).style.display = 'none';
    }
  });
  // Cerrar el menú después de seleccionar filtro
  const menu = document.getElementById('filterMenu');
  if (menu) {
    menu.classList.add('hidden');
  }
}

function añadirColumna(textoExistente = '') {
  const board = document.getElementById('board') as HTMLElement;
  const templateElement = document.getElementById('template-columna') as HTMLTemplateElement;
  const template = templateElement.content;
  const clon = document.importNode(template, true);
  const columna = clon.querySelector('.columna') as HTMLElement;
  const header = clon.querySelector('.columna-header') as HTMLElement;
  const titulo = clon.querySelector('.columna-header input') as HTMLInputElement;
  const contenedorTareas = clon.querySelector('.contenedor-tareas') as HTMLElement;
  const btnTarea = clon.querySelector('.add-card-btn') as HTMLButtonElement;
  if (
    !board ||
    !templateElement ||
    !columna ||
    !header ||
    !titulo ||
    !contenedorTareas ||
    !btnTarea
  )
    return;

  // Si viene de la base de datos, le ponemos su título real
  titulo.value = textoExistente;

  titulo.addEventListener('change', guardarEstado);
  ContenedorDrop(contenedorTareas);
  crearBotonesAccion(header, titulo, columna);
  board.appendChild(clon);
  actualizarContadores();

  btnTarea.onclick = () => crearTarea(contenedorTareas, '');

  // if (textoExistente === '') {
  //   guardarEstado();
  // }
}
// Drag and Drop

let tareaArrastrada: HTMLElement | null = null;

function DragAndDrop(tarea: HTMLElement) {
  tarea.setAttribute('draggable', 'true');
  tarea.ondragstart = () => {
    tarea.classList.add('dragging');
    tareaArrastrada = tarea;
  };
  tarea.ondragend = () => {
    tarea.classList.remove('dragging');
    tareaArrastrada = null;
  };
}

function ContenedorDrop(contenedor: HTMLElement) {
  contenedor.ondragover = (e) => {
    e.preventDefault();
    contenedor.classList.add('drag-over');
  };
  contenedor.ondragleave = () => contenedor.classList.remove('drag-over');
  contenedor.ondrop = () => {
    contenedor.classList.remove('drag-over');
    if (tareaArrastrada) {
      contenedor.appendChild(tareaArrastrada);
      guardarEstado();
    }
  };
}

// botones de editar y eliminar

function crearBotonesAccion(
  contenedorBotones: HTMLElement,
  inputAEnfocar: HTMLInputElement,
  elementoAEliminar: HTMLElement
) {
  const btnPuntos = contenedorBotones.querySelector('.btn-tres-puntos') as HTMLButtonElement;
  const menu = contenedorBotones.querySelector('.menu-opciones') as HTMLElement;
  if (!btnPuntos || !menu) return;
  const btnEditar = menu.querySelector('.btnEditar') as HTMLButtonElement;
  const btnEliminar = menu.querySelector('.btnEliminar') as HTMLButtonElement;
  if (!btnEditar || !btnEliminar) return;

  btnPuntos.onclick = (e) => {
    e.stopPropagation();

    // 2. Guarda si el menú ya estaba abierto antes de cerrar todos
    const estabaAbierto = (menu as HTMLElement).style.display === 'block';

    // 3. Cierra todo los menús que existan en la página
    document
      .querySelectorAll('.menu-opciones')
      .forEach((m) => ((m as HTMLElement).style.display = 'none'));

    // 4. Si no estaba abierto, aparece
    if (!estabaAbierto) {
      menu.style.display = 'block';
    }
  };

  btnEditar.addEventListener('click', () => {
    inputAEnfocar.focus();
    (menu as HTMLElement).style.display = 'none';
  });

  btnEliminar.addEventListener('click', function () {
    if (confirm('¿Eliminar este elemento?')) {
      elementoAEliminar.remove();
      guardarEstado();
    }
  });

  // Si haces clic fuera del menú, se cierra solo
  document.addEventListener('click', () => ((menu as HTMLElement).style.display = 'none'));
}

function crearTarea(
  contenedor: HTMLElement,
  textoExistente = '',
  fechaGuardada: string | null = null,
  tipoGuardado: string | undefined = undefined
) {
  const templateElement = document.getElementById('template-tarea') as HTMLTemplateElement;
  const clon = document.importNode(templateElement.content, true);

  const tarea = clon.querySelector('.tarea') as HTMLElement;
  const tareaTop = clon.querySelector('.tarea-top') as HTMLElement;
  const inputTarea = clon.querySelector('input') as HTMLInputElement;
  const fecha = clon.querySelector('.fecha') as HTMLElement;
  const selectTipo = clon.querySelector('.tipo-tarea') as HTMLSelectElement;
  const contenedorEtiquetas = clon.querySelector('.etiquetas') as HTMLElement;

  // Inicializar dataset.tipo vacío por defecto
  tarea.dataset.tipo = '';

  // pintar etiqueta
  function pintarEtiqueta(tipo: string) {
    contenedorEtiquetas.innerHTML = '';
    const etiqueta = document.createElement('span');
    etiqueta.classList.add('etiqueta');

    if (tipo === 'DESIGN') etiqueta.classList.add('design');
    if (tipo === 'BUG') etiqueta.classList.add('bug');
    if (tipo === 'URGENT') etiqueta.classList.add('urgent');

    etiqueta.textContent = tipo;

    contenedorEtiquetas.appendChild(etiqueta);
  }

  // Fecha
  if (fechaGuardada) {
    fecha.textContent = fechaGuardada;
  } else {
    const fechaActual = new Date();
    fecha.textContent = fechaActual.toLocaleDateString('es-ES');
  }

  // Texto
  inputTarea.value = textoExistente;
  inputTarea.addEventListener('change', guardarEstado);

  // TIPO
  if (tipoGuardado) {
    // tarea ya existente
    selectTipo.value = tipoGuardado;
    tarea.dataset.tipo = tipoGuardado;
    pintarEtiqueta(tipoGuardado);
    (selectTipo as HTMLElement).style.display = 'none';
  } else {
    // si la tarea es nueva se muestra
    (selectTipo as HTMLElement).style.display = 'block';
  }

  // cambiar tipo
  selectTipo.addEventListener('change', () => {
    const nuevoTipo = selectTipo.value;
    tarea.dataset.tipo = nuevoTipo;
    pintarEtiqueta(nuevoTipo);
    (selectTipo as HTMLElement).style.display = 'none'; // se oculta después de elegir
    guardarEstado();
  });

  crearBotonesAccion(tarea, inputTarea, tarea);
  DragAndDrop(tarea);

  contenedor.appendChild(clon);
  actualizarContadores();
  // guardar solo si ya eligió tipo
  if (textoExistente === '' && tipoGuardado) {
    guardarEstado();
  }
}

function actualizarContadores(): void {
  const columnas = document.querySelectorAll('.columna');
  columnas.forEach((col) => {
    const columna = col as HTMLElement;
    const numTareas = columna.querySelectorAll('.tarea').length;
    const contadorSpan = columna.querySelector('.contador-tareas') as HTMLElement;
    if (contadorSpan) {
      contadorSpan.textContent = numTareas.toString();
    }
  });
}

/* LOCAL STORAGE */
interface TareaDatos {
  titulo: string;
  tipo?: string;
  fecha: string;
}

interface ColumnaDatos {
  titulo: string;
  tareas: TareaDatos[];
}
function guardarEstado() {
  const columnas: ColumnaDatos[] = [];
  document.querySelectorAll('.columna').forEach((col) => {
    const inputTitulo = col.querySelector('.columna-header input') as HTMLInputElement;
    const titulo = inputTitulo ? inputTitulo.value : '';
    const tareas: TareaDatos[] = [];
    col.querySelectorAll('.tarea').forEach((t) => {
      const inputTarea = t.querySelector('input') as HTMLInputElement;
      const tipo = (t as HTMLElement).dataset.tipo || '';
      const fechaTexto = t.querySelector('.fecha')?.textContent || '';
      tareas.push({ titulo: inputTarea.value, tipo, fecha: fechaTexto });
    });
    columnas.push({ titulo, tareas });
  });
  actualizarContadores();
  // convertir en texto json
  localStorage.setItem('kanban_data', JSON.stringify(columnas));
}

// Type Guard para validar que los datos cargados del localStorage tienen la forma correcta
function isColumn(column: any | ColumnaDatos): column is ColumnaDatos {
  return (
    (column as ColumnaDatos).tareas !== undefined && (column as ColumnaDatos).titulo !== undefined
  );
}

function cargarEstado() {
  const board = document.getElementById('board') as HTMLElement;
  const datosRaw = localStorage.getItem('kanban_data');
  if (!datosRaw || !board) return;

  let datos: ColumnaDatos[] = [];

  try {
    const quizaColumnas = JSON.parse(datosRaw);

    if (Array.isArray(quizaColumnas) && quizaColumnas.every(isColumn)) {
      datos = quizaColumnas;
    }
  } catch (e) {
    console.error('Error al cargar datos del localStorage:', e);
    return;
  }

  // let datos: ColumnaDatos[] = [];
  // try {
  //   datos = JSON.parse(datosRaw);
  // } catch (e) {
  //   // console.error('Error al analizar JSON del localStorage:', e);
  //   return;
  // }
  // const datos = JSON.parse(datosRaw) as ColumnaDatos[];
  board.innerHTML = ''; // Limpiamos el tablero antes de cargar

  datos.forEach((dataCol) => {
    añadirColumna(dataCol.titulo);
    const todasLasColumnas = board.querySelectorAll('.contenedor-tareas');
    const contenedorTareasActual = todasLasColumnas[todasLasColumnas.length - 1] as HTMLElement;

    dataCol.tareas.forEach((tareaDatos) => {
      const texto = typeof tareaDatos === 'string' ? tareaDatos : tareaDatos.titulo;
      const tipo = typeof tareaDatos === 'string' ? undefined : tareaDatos.tipo;
      const fecha = typeof tareaDatos === 'string' ? null : tareaDatos.fecha;
      crearTarea(contenedorTareasActual, texto, fecha, tipo);
    });
  });
  actualizarContadores();
}
