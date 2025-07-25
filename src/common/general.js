export const mainCamera = "CAM01";
export const inputCapturasDirectorio = "/images/input/";
export const outputCapturasDirectorio = "/images/output/";

export const frame01 = "frame_001.jpg";

export function formatDateToPE(date) {
    var formatedDate= new Date(date);

    return formatedDate.toLocaleString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

export function damagesToES(damageType) {
    var damageInES = '';

    switch (damageType) {
        case 'line':
            damageInES = 'Linea';
            break;
        case 'stain':
            damageInES = 'Mancha';
            break;
        case 'hole':
            damageInES = 'Hueco';
            break;
        default:
            damageInES = 'No especificado'
            break;
    }
    return damageInES;
}