// Formatar data para exibição
function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Capitalizar primeira letra
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Validar se um nível de campeonato permite uma equipe
function canTeamJoinChampionship(team, championship) {
    switch (championship.level) {
        case 'Nacional':
            return team.country === championship.country;
        case 'Continental':
            return team.continent === championship.continent;
        case 'Mundial':
            return true;
        default:
            return false;
    }
}

// Calcular média dos níveis da equipe
function calculateTeamOverall(team) {
    const { attackLevel, midfieldLevel, defenseLevel, resistanceLevel } = team;
    return Math.round((attackLevel + midfieldLevel + defenseLevel + resistanceLevel) / 4);
}

// Gerar slug para URLs
function generateSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
}

// Validar código de cor hexadecimal
function isValidHexColor(color) {
    return /^#[0-9A-F]{6}$/i.test(color);
}

module.exports = {
    formatDate,
    capitalize,
    canTeamJoinChampionship,
    calculateTeamOverall,
    generateSlug,
    isValidHexColor,
};