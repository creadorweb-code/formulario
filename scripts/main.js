// ============================================
// CONFIGURACIÓN DE SUPABASE
// ============================================

const SUPABASE_URL = 'https://tsjwpcvhyldrizpwfpyq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzandwY3ZoeWxkcml6cHdmcHlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODQ3NDksImV4cCI6MjA4NjA2MDc0OX0.dhrG9IZ_czwkB_rL5CU5m-BagIpBw5wNTxEMWCUnvxM'; // Tu anon/public key

// Inicializar cliente de Supabase
supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// CÓDIGO DEL FORMULARIO
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const queryTypeRadios = document.querySelectorAll('input[name="queryType"]');
    const message = document.getElementById('message');
    const consent = document.getElementById('consent');
    const radioOptions = document.querySelectorAll('.radio-option');

    // Manejar selección de radio buttons con estilo visual
    radioOptions.forEach(option => {
        option.addEventListener('click', function () {
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;

            // Remover clase selected de todas las opciones
            radioOptions.forEach(opt => opt.classList.remove('selected'));

            // Agregar clase selected a la opción clickeada
            this.classList.add('selected');

            // Remover error si existe
            const queryTypeGroup = radio.closest('.form-group');
            queryTypeGroup.classList.remove('error');
        });
    });

    // Validación de email en tiempo real
    email.addEventListener('blur', function () {
        validateEmail(this);
    });

    email.addEventListener('input', function () {
        if (this.value.trim() !== '') {
            this.parentElement.classList.remove('error');
        }
    });

    // Remover error al escribir en campos de texto
    firstName.addEventListener('input', function () {
        if (this.value.trim() !== '') {
            this.parentElement.classList.remove('error');
        }
    });

    lastName.addEventListener('input', function () {
        if (this.value.trim() !== '') {
            this.parentElement.classList.remove('error');
        }
    });

    message.addEventListener('input', function () {
        if (this.value.trim() !== '') {
            this.parentElement.classList.remove('error');
        }
    });

    // Remover error al marcar checkbox
    consent.addEventListener('change', function () {
        if (this.checked) {
            const consentGroup = this.closest('.checkbox-group');
            consentGroup.classList.remove('error');
        }
    });

    // Validación del formulario al enviar
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        let isValid = true;

        // Validar First Name
        if (firstName.value.trim() === '') {
            showError(firstName);
            isValid = false;
        } else {
            hideError(firstName);
        }

        // Validar Last Name
        if (lastName.value.trim() === '') {
            showError(lastName);
            isValid = false;
        } else {
            hideError(lastName);
        }

        // Validar Email
        if (!validateEmail(email)) {
            isValid = false;
        }

        // Validar Query Type
        const queryTypeChecked = Array.from(queryTypeRadios).some(radio => radio.checked);
        const queryTypeGroup = document.querySelector('.radio-group').parentElement;

        if (!queryTypeChecked) {
            queryTypeGroup.classList.add('error');
            isValid = false;
        } else {
            queryTypeGroup.classList.remove('error');
        }

        // Validar Message
        if (message.value.trim() === '') {
            showError(message);
            isValid = false;
        } else {
            hideError(message);
        }

        // Validar Consent
        const consentGroup = consent.closest('.checkbox-group');

        if (!consent.checked) {
            consentGroup.classList.add('error');
            isValid = false;
        } else {
            consentGroup.classList.remove('error');
        }

        // Si todo es válido, enviar a Supabase
        if (isValid) {
            await submitToSupabase();
        } else {
            // Scroll al primer campo con error
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    // ============================================
    // FUNCIÓN PARA ENVIAR A SUPABASE
    // ============================================
    async function submitToSupabase() {
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;

        // Deshabilitar botón y cambiar texto
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        submitBtn.style.opacity = '0.7';
        submitBtn.style.cursor = 'not-allowed';

        try {
            // Preparar los datos
            const formData = {
                first_name: firstName.value.trim(),
                last_name: lastName.value.trim(),
                email: email.value.trim(),
                query_type: document.querySelector('input[name="queryType"]:checked').value,
                message: message.value.trim(),
                consent: consent.checked
            };

            // Insertar en Supabase
            const { data, error } = await supabase
                .from('contacts')
                .insert([formData]);

            if (error) throw error;

            // Éxito
            alert('✅ Message send! \n thanks for completing the form, We`ll be in touch soon! ');

            // Resetear formulario
            form.reset();
            radioOptions.forEach(opt => opt.classList.remove('selected'));

        } catch (error) {
            console.error('Error al enviar:', error);

            // Verificar si es un error de configuración
            if (error.message.includes('fetch')) {
                alert('❌ Error: Please configure your Supabase credentials in script.js');
            } else {
                alert('❌ Oops! Something went wrong. Please try again.');
            }
        } finally {
            // Rehabilitar botón
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
    }

    // Función para mostrar error
    function showError(input) {
        input.parentElement.classList.add('error');
    }

    // Función para ocultar error
    function hideError(input) {
        input.parentElement.classList.remove('error');
    }

    // Función para validar email
    function validateEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const value = input.value.trim();

        if (value === '') {
            showError(input);
            return false;
        } else if (!emailRegex.test(value)) {
            showError(input);
            return false;
        } else {
            hideError(input);
            return true;
        }
    }
});