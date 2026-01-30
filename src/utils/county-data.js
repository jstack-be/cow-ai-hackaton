// Mapping of Irish counties and their neighboring counties
export const COUNTY_ADJACENCY = {
  'Dublin': ['Meath', 'Kildare', 'Wicklow'],
  'Meath': ['Dublin', 'Kildare', 'Westmeath', 'Offaly', 'Louth', 'Cavan'],
  'Kildare': ['Dublin', 'Meath', 'Wicklow', 'Carlow', 'Laois', 'Offaly', 'Westmeath'],
  'Wicklow': ['Dublin', 'Kildare', 'Carlow', 'Wexford'],
  'Carlow': ['Kildare', 'Wicklow', 'Wexford', 'Kilkenny', 'Laois'],
  'Wexford': ['Carlow', 'Wicklow', 'Kilkenny', 'Waterford'],
  'Kilkenny': ['Carlow', 'Wexford', 'Waterford', 'Tipperary', 'Laois'],
  'Waterford': ['Wexford', 'Kilkenny', 'Tipperary', 'Cork', 'Limerick'],
  'Cork': ['Waterford', 'Kerry', 'Limerick', 'Tipperary'],
  'Kerry': ['Cork', 'Limerick'],
  'Limerick': ['Kerry', 'Cork', 'Waterford', 'Tipperary', 'Clare'],
  'Tipperary': ['Kilkenny', 'Waterford', 'Cork', 'Limerick', 'Clare', 'Offaly', 'Laois'],
  'Clare': ['Limerick', 'Tipperary', 'Galway', 'Roscommon'],
  'Laois': ['Kildare', 'Carlow', 'Kilkenny', 'Tipperary', 'Offaly', 'Westmeath'],
  'Offaly': ['Meath', 'Kildare', 'Laois', 'Tipperary', 'Westmeath', 'Roscommon'],
  'Westmeath': ['Meath', 'Kildare', 'Offaly', 'Roscommon', 'Longford'],
  'Roscommon': ['Offaly', 'Westmeath', 'Longford', 'Leitrim', 'Sligo', 'Galway', 'Clare'],
  'Galway': ['Clare', 'Roscommon', 'Mayo'],
  'Mayo': ['Galway', 'Roscommon', 'Sligo'],
  'Sligo': ['Roscommon', 'Mayo', 'Leitrim', 'Donegal'],
  'Leitrim': ['Roscommon', 'Sligo', 'Donegal', 'Cavan', 'Longford'],
  'Longford': ['Westmeath', 'Roscommon', 'Leitrim', 'Cavan'],
  'Cavan': ['Meath', 'Louth', 'Monaghan', 'Fermanagh', 'Tyrone', 'Longford', 'Leitrim'],
  'Monaghan': ['Cavan', 'Louth', 'Armagh', 'Tyrone', 'Fermanagh'],
  'Louth': ['Meath', 'Cavan', 'Monaghan', 'Armagh', 'Down'],
  'Armagh': ['Monaghan', 'Louth', 'Down', 'Tyrone'],
  'Down': ['Louth', 'Armagh', 'Antrim'],
  'Tyrone': ['Cavan', 'Monaghan', 'Armagh', 'Fermanagh', 'Donegal'],
  'Fermanagh': ['Cavan', 'Monaghan', 'Tyrone', 'Donegal'],
  'Donegal': ['Sligo', 'Leitrim', 'Fermanagh', 'Tyrone'],
  'Antrim': ['Down', 'Derry'],
  'Derry': ['Antrim', 'Tyrone']
};

/**
 * Check if two counties are the same or adjacent
 * @param {string} county1 - First county name
 * @param {string} county2 - Second county name
 * @returns {Object} { close: boolean, weight: number }
 */
export function areCountiesClose(county1, county2) {
  if (county1 === county2) {
    return { close: true, weight: 0.8 };
  }

  if (COUNTY_ADJACENCY[county1]?.includes(county2)) {
    return { close: true, weight: 0.4 };
  }

  return { close: false, weight: 0 };
}

/**
 * Get all counties
 * @returns {Array<string>} List of all Irish county names
 */
export function getAllCounties() {
  return Object.keys(COUNTY_ADJACENCY).sort();
}

/**
 * Get neighboring counties for a given county
 * @param {string} county - County name
 * @returns {Array<string>} List of neighboring counties
 */
export function getNeighboringCounties(county) {
  return COUNTY_ADJACENCY[county] || [];
}

export default {
  COUNTY_ADJACENCY,
  areCountiesClose,
  getAllCounties,
  getNeighboringCounties
};
