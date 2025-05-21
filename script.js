// Variables globales
const editPopup = document.getElementById('edit-popup');
const deletePopup = document.getElementById('delete-popup');
const deleteImagePopup = document.getElementById('delete-image-popup');
const editTextarea = document.getElementById('edit-textarea');
let currentCommentToEdit = null;
let currentCommentToDelete = null;
let imageToDelete = null;
let currentModalImages = [];
let currentImageIndex = 0;
let commentsInitialized = false;

// Input para añadir imágenes en edición
const addImagesInput = document.createElement('input');
addImagesInput.type = 'file';
addImagesInput.multiple = true;
addImagesInput.accept = 'image/*';
addImagesInput.style.display = 'none';
document.body.appendChild(addImagesInput);

// Tabs principales
function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    const tabButtons = document.getElementsByClassName("tab-button");

    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }

    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
    
   commentsInitialized = false;
    setTimeout(initializeComments, 50);
}

// Sub-tabs de regiones
function openRegionTab(evt, tabName) {
    const regionTabContents = document.querySelectorAll(".region-tab-content");
    const regionTabButtons = document.querySelectorAll(".region-tab-button");

    regionTabContents.forEach(tab => tab.classList.remove("active"));
    regionTabButtons.forEach(btn => btn.classList.remove("active"));

    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
    
    commentsInitialized = false;
    setTimeout(initializeComments, 50);
}





// Función para inicializar todos los comentarios
function initializeComments() {
    // Reinicializar los botones para evitar duplicación de eventos
    document.querySelectorAll('.submit-comment').forEach(button => {
        const newButton = button.cloneNode(true);
        button.replaceWith(newButton);
    });

    // Configurar todos los botones de subida de imágenes (solo si no fueron inicializados)
    document.querySelectorAll('.upload-button:not([data-initialized])').forEach(button => {
        const input = button.parentElement.querySelector('.image-upload-input');
        const preview = button.parentElement.querySelector('.preview-images');

        button.addEventListener('click', () => input.click());
        button.setAttribute('data-initialized', 'true');

        input.addEventListener('change', function () {
            preview.innerHTML = '';
            if (this.files) {
                Array.from(this.files).forEach(file => {
                    if (file.type.match('image.*')) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            img.className = 'preview-thumbnail';
                            img.title = 'Haz clic para eliminar esta imagen';
                            img.addEventListener('click', () => img.remove());
                            preview.appendChild(img);
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }
        });
    });



    // Configurar eventos para comentarios existentes
    document.querySelectorAll('.comment').forEach(comment => {
        if (!comment.hasAttribute('data-initialized')) {
            setupCommentEdit(comment);

            const deleteBtn = comment.querySelector('.delete-button');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    currentCommentToDelete = comment;
                    deletePopup.style.display = 'flex';
                });
            }

            comment.setAttribute('data-initialized', 'true');
        }
    });
}




    // Configurar eventos para comentarios existentes
    document.querySelectorAll('.comment').forEach(comment => {
        if (!comment.hasAttribute('data-initialized')) {
            setupCommentEdit(comment);
            
            const deleteBtn = comment.querySelector('.delete-button');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => {
                    currentCommentToDelete = comment;
                    deletePopup.style.display = 'flex';
                });
            }
            
            comment.setAttribute('data-initialized', 'true');
        }
    });

// Función para añadir comentarios (versión corregida)
function addComment(button) {
    // Deshabilitar el botón temporalmente para evitar múltiples clics
    button.disabled = true;

    const commentSection = button.closest('.comments-section');
    const textarea = commentSection.querySelector('.comment-textarea');
    const previewContainer = commentSection.querySelector('.preview-images');
    
    const commentText = textarea.value.trim();
    const hasText = commentText !== '';
    const hasImages = previewContainer && previewContainer.querySelectorAll('img.preview-thumbnail').length > 0;

    //Validación corregida
    if (!hasText && !hasImages) {
       alert('Por favor, añade texto o al menos una imagen');
        button.disabled = false;
        return;
    }

    const commentList = commentSection.querySelector('.comments-list');
    const newComment = document.createElement('div');
    newComment.className = 'comment';

    // Crear HTML para las imágenes
    let imagesHTML = '';
    if (hasImages && previewContainer) {
        const previewImages = previewContainer.querySelectorAll('img.preview-thumbnail');
        if (previewImages.length > 0) {
            Array.from(previewImages).forEach(img => {
                imagesHTML += `<img src="${img.src}" class="comment-image" onclick="openModal('${img.src}')">`;
            });
        }
    }

    // Crear el contenido del comentario
    newComment.innerHTML = `
        ${hasText ? `<p class="comment-text">${commentText}</p>` : ''}
        ${imagesHTML ? `<div class="comment-images">${imagesHTML}</div>` : ''}
        <span class="comment-date">${new Date().toLocaleString()}</span>
        <div class="comment-actions">
            <button class="edit-button">Editar</button>
            <button class="delete-button">Eliminar</button>
        </div>
    `;

    // Configurar eventos para el nuevo comentario
    setupCommentEdit(newComment);
    
    newComment.querySelector('.delete-button').addEventListener('click', () => {
        currentCommentToDelete = newComment;
        deletePopup.style.display = 'flex';
    });

    commentList.prepend(newComment);
    textarea.value = '';
    if (previewContainer) {
        previewContainer.innerHTML = '';
    }

    // Restaurar el botón después de 500ms
    setTimeout(() => {
        button.disabled = false;
    }, 500);
}

// Configurar la edición de un comentario
function setupCommentEdit(commentElement) {
    const editButton = commentElement.querySelector('.edit-button');
    if (!editButton) return;

    editButton.addEventListener('click', () => {
        currentCommentToEdit = commentElement;
        const commentText = commentElement.querySelector('.comment-text');
        editTextarea.value = commentText ? commentText.innerText : '';

        // Limpiar y cargar imágenes existentes en el editor
        const editImagesContainer = document.getElementById('edit-images-container');
        editImagesContainer.innerHTML = '';
        
        // Añadir botón para agregar más imágenes
        const addImagesButton = document.createElement('button');
        addImagesButton.textContent = 'Añadir más imágenes';
        addImagesButton.className = 'add-images-button';
        addImagesButton.addEventListener('click', () => addImagesInput.click());
        
        const editControls = document.createElement('div');
        editControls.className = 'edit-images-controls';
        editControls.appendChild(addImagesButton);
        editImagesContainer.appendChild(editControls);

        // Cargar imágenes existentes
        const existingImages = commentElement.querySelectorAll('.comment-image');
        existingImages.forEach(img => {
            createImageInEditor(img.src, editImagesContainer, editControls);
        });

        editPopup.style.display = 'flex';
    });
}

// Crear una imagen en el editor con controles de eliminación
function createImageInEditor(src, container, controlsElement) {
    const imgWrapper = document.createElement('div');
    imgWrapper.style.position = 'relative';
    imgWrapper.style.display = 'inline-block';
    imgWrapper.style.margin = '5px';
    
    const img = document.createElement('img');
    img.src = src;
    img.style.width = '100px';
    img.style.height = '100px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '4px';
    
    const deleteIcon = document.createElement('span');
    deleteIcon.innerHTML = '&times;';
    deleteIcon.style.position = 'absolute';
    deleteIcon.style.top = '5px';
    deleteIcon.style.right = '5px';
    deleteIcon.style.background = 'red';
    deleteIcon.style.color = 'white';
    deleteIcon.style.borderRadius = '50%';
    deleteIcon.style.width = '20px';
    deleteIcon.style.height = '20px';
    deleteIcon.style.display = 'flex';
    deleteIcon.style.justifyContent = 'center';
    deleteIcon.style.alignItems = 'center';
    deleteIcon.style.cursor = 'pointer';
    
    deleteIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        imageToDelete = imgWrapper;
        deleteImagePopup.style.display = 'flex';
    });
    
    imgWrapper.appendChild(img);
    imgWrapper.appendChild(deleteIcon);
    container.insertBefore(imgWrapper, controlsElement);
}

// Modal de imágenes
function openModal(imgSrc) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');

    const target = event ? event.target : null;
    const comment = target ? target.closest('.comment') : null;
    if (!comment) {
        modal.style.display = "block";
        modalImg.src = imgSrc;
        document.querySelector('.prev').style.display = 'none';
        document.querySelector('.next').style.display = 'none';
        return;
    }

    const commentImages = comment.querySelectorAll('.comment-image');
    currentModalImages = Array.from(commentImages).map(img => img.src);
    currentImageIndex = currentModalImages.indexOf(imgSrc);

    modal.style.display = "block";
    modalImg.src = imgSrc;

    document.querySelector('.prev').style.display = currentModalImages.length > 1 ? 'block' : 'none';
    document.querySelector('.next').style.display = currentModalImages.length > 1 ? 'block' : 'none';
}

function navigateImages(direction) {
    currentImageIndex += direction;
    if (currentImageIndex >= currentModalImages.length) currentImageIndex = 0;
    if (currentImageIndex < 0) currentImageIndex = currentModalImages.length - 1;
    document.getElementById('modal-image').src = currentModalImages[currentImageIndex];
}

function closeModal() {
    document.getElementById('image-modal').style.display = "none";
    currentModalImages = [];
    currentImageIndex = 0;
}

// Función para cambiar imagen principal en la galería
function changeMainImage(element) {
    const mainImage = document.getElementById('main-gallery-image');
    if (mainImage) {
        mainImage.src = element.src;
    }
}

// Configuración inicial cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    initializeComments();

    // Configurar eventos para los popups
    document.getElementById('edit-confirm').addEventListener('click', () => {
        if (currentCommentToEdit) {
            const textElement = currentCommentToEdit.querySelector('.comment-text');
            if (textElement) {
                textElement.innerText = editTextarea.value;
            } else if (editTextarea.value.trim() !== '') {
                const newTextElement = document.createElement('p');
                newTextElement.className = 'comment-text';
                newTextElement.innerText = editTextarea.value;
                currentCommentToEdit.insertBefore(newTextElement, currentCommentToEdit.firstChild);
            }

            let imagesContainer = currentCommentToEdit.querySelector('.comment-images');
            const editImages = document.querySelectorAll('#edit-images-container img:not(.preview-thumbnail)');
            
            if (editImages.length > 0) {
                if (!imagesContainer) {
                    imagesContainer = document.createElement('div');
                    imagesContainer.className = 'comment-images';
                    
                    const textElement = currentCommentToEdit.querySelector('.comment-text');
                    if (textElement) {
                        textElement.after(imagesContainer);
                    } else {
                        currentCommentToEdit.insertBefore(imagesContainer, currentCommentToEdit.firstChild);
                    }
                } else {
                    imagesContainer.innerHTML = '';
                }
                
                editImages.forEach(img => {
                    const newImg = document.createElement('img');
                    newImg.src = img.src;
                    newImg.className = 'comment-image';
                    newImg.onclick = function() { openModal(newImg.src); };
                    imagesContainer.appendChild(newImg);
                });
            } else if (imagesContainer) {
                imagesContainer.remove();
            }

            editPopup.style.display = 'none';
            currentCommentToEdit = null;
        }
    });

    document.getElementById('edit-cancel').addEventListener('click', () => {
        editPopup.style.display = 'none';
        currentCommentToEdit = null;
    });

    document.getElementById('delete-confirm').addEventListener('click', () => {
        if (currentCommentToDelete) {
            currentCommentToDelete.remove();
            currentCommentToDelete = null;
        }
        deletePopup.style.display = 'none';
    });

    document.getElementById('delete-cancel').addEventListener('click', () => {
        deletePopup.style.display = 'none';
        currentCommentToDelete = null;
    });

    // Configurar el input para añadir imágenes en edición
    addImagesInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            const editImagesContainer = document.getElementById('edit-images-container');
            const editControls = editImagesContainer.querySelector('.edit-images-controls');
            
            Array.from(this.files).forEach(file => {
                if (file.type.match('image.*')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        createImageInEditor(e.target.result, editImagesContainer, editControls);
                    };
                    reader.readAsDataURL(file);
                }
            });
            this.value = '';
        }
    });

    // Configurar los botones del popup de eliminar imagen
    document.getElementById('delete-image-confirm').addEventListener('click', () => {
        if (imageToDelete) {
            imageToDelete.remove();
            imageToDelete = null;
        }
        deleteImagePopup.style.display = 'none';
    });

    document.getElementById('delete-image-cancel').addEventListener('click', () => {
        imageToDelete = null;
        deleteImagePopup.style.display = 'none';
    });

    // Cerrar popups al hacer clic fuera del contenido
    [editPopup, deletePopup, deleteImagePopup].forEach(popup => {
        if (popup) {
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    popup.style.display = 'none';
                    if (popup === editPopup) currentCommentToEdit = null;
                    if (popup === deletePopup) currentCommentToDelete = null;
                    if (popup === deleteImagePopup) imageToDelete = null;
                }
            });
        }
    });

    // Configurar eventos del modal de imágenes
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    const prevBtn = document.querySelector('.prev');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => navigateImages(-1));
    }
    
    const nextBtn = document.querySelector('.next');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => navigateImages(1));
    }

    // Configurar la galería si existe
    if (document.querySelector('.thumbnail-container')) {
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                const mainImg = document.querySelector('#main-gallery-image');
                if (mainImg) {
                    mainImg.src = this.src;
                }
            });
        });
    }
    
    // Inicializar el primer thumbnail si existe la galería
    const firstThumbnail = document.querySelector('.thumbnail');
    const mainGalleryImage = document.getElementById('main-gallery-image');
    if (firstThumbnail && mainGalleryImage && !mainGalleryImage.src) {
        mainGalleryImage.src = firstThumbnail.src;
    }
});