/**
 * ISO 3166-1 country reference data.
 *
 * Generated from the official ISO 3166 list (alpha-2, alpha-3, region,
 * sub-region). Display names keep the shorter, friendlier forms the UI already
 * used (e.g. 'United Kingdom' rather than the full official name).
 *
 * Single source of truth — the dropdown, the URL parser and region export all
 * read from here.
 */

export interface Country {
  code: string;
  alpha3: string;
  name: string;
  region: string;
  subregion: string;
}

export const COUNTRIES: Country[] = [
  { code: 'AD', alpha3: 'AND', name: "Andorra", region: 'Europe', subregion: "Southern Europe" },
  { code: 'AE', alpha3: 'ARE', name: "United Arab Emirates", region: 'Asia', subregion: "Western Asia" },
  { code: 'AF', alpha3: 'AFG', name: "Afghanistan", region: 'Asia', subregion: "Southern Asia" },
  { code: 'AG', alpha3: 'ATG', name: "Antigua and Barbuda", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'AI', alpha3: 'AIA', name: "Anguilla", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'AL', alpha3: 'ALB', name: "Albania", region: 'Europe', subregion: "Southern Europe" },
  { code: 'AM', alpha3: 'ARM', name: "Armenia", region: 'Asia', subregion: "Western Asia" },
  { code: 'AO', alpha3: 'AGO', name: "Angola", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'AQ', alpha3: 'ATA', name: "Antarctica", region: 'Other', subregion: "" },
  { code: 'AR', alpha3: 'ARG', name: "Argentina", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'AS', alpha3: 'ASM', name: "American Samoa", region: 'Oceania', subregion: "Polynesia" },
  { code: 'AT', alpha3: 'AUT', name: "Austria", region: 'Europe', subregion: "Western Europe" },
  { code: 'AU', alpha3: 'AUS', name: "Australia", region: 'Oceania', subregion: "Australia and New Zealand" },
  { code: 'AW', alpha3: 'ABW', name: "Aruba", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'AX', alpha3: 'ALA', name: "Åland Islands", region: 'Europe', subregion: "Northern Europe" },
  { code: 'AZ', alpha3: 'AZE', name: "Azerbaijan", region: 'Asia', subregion: "Western Asia" },
  { code: 'BA', alpha3: 'BIH', name: "Bosnia and Herzegovina", region: 'Europe', subregion: "Southern Europe" },
  { code: 'BB', alpha3: 'BRB', name: "Barbados", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'BD', alpha3: 'BGD', name: "Bangladesh", region: 'Asia', subregion: "Southern Asia" },
  { code: 'BE', alpha3: 'BEL', name: "Belgium", region: 'Europe', subregion: "Western Europe" },
  { code: 'BF', alpha3: 'BFA', name: "Burkina Faso", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'BG', alpha3: 'BGR', name: "Bulgaria", region: 'Europe', subregion: "Eastern Europe" },
  { code: 'BH', alpha3: 'BHR', name: "Bahrain", region: 'Asia', subregion: "Western Asia" },
  { code: 'BI', alpha3: 'BDI', name: "Burundi", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'BJ', alpha3: 'BEN', name: "Benin", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'BL', alpha3: 'BLM', name: "Saint Barthélemy", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'BM', alpha3: 'BMU', name: "Bermuda", region: 'Americas', subregion: "Northern America" },
  { code: 'BN', alpha3: 'BRN', name: "Brunei", region: 'Asia', subregion: "South-eastern Asia" },
  { code: 'BO', alpha3: 'BOL', name: "Bolivia", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'BQ', alpha3: 'BES', name: "Bonaire, Sint Eustatius and Saba", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'BR', alpha3: 'BRA', name: "Brazil", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'BS', alpha3: 'BHS', name: "Bahamas", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'BT', alpha3: 'BTN', name: "Bhutan", region: 'Asia', subregion: "Southern Asia" },
  { code: 'BV', alpha3: 'BVT', name: "Bouvet Island", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'BW', alpha3: 'BWA', name: "Botswana", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'BY', alpha3: 'BLR', name: "Belarus", region: 'Europe', subregion: "Eastern Europe" },
  { code: 'BZ', alpha3: 'BLZ', name: "Belize", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'CA', alpha3: 'CAN', name: "Canada", region: 'Americas', subregion: "Northern America" },
  { code: 'CC', alpha3: 'CCK', name: "Cocos (Keeling) Islands", region: 'Oceania', subregion: "Australia and New Zealand" },
  { code: 'CD', alpha3: 'COD', name: "Democratic Republic of the Congo", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'CF', alpha3: 'CAF', name: "Central African Republic", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'CG', alpha3: 'COG', name: "Republic of the Congo", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'CH', alpha3: 'CHE', name: "Switzerland", region: 'Europe', subregion: "Western Europe" },
  { code: 'CI', alpha3: 'CIV', name: "Côte d'Ivoire", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'CK', alpha3: 'COK', name: "Cook Islands", region: 'Oceania', subregion: "Polynesia" },
  { code: 'CL', alpha3: 'CHL', name: "Chile", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'CM', alpha3: 'CMR', name: "Cameroon", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'CN', alpha3: 'CHN', name: "China", region: 'Asia', subregion: "Eastern Asia" },
  { code: 'CO', alpha3: 'COL', name: "Colombia", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'CR', alpha3: 'CRI', name: "Costa Rica", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'CU', alpha3: 'CUB', name: "Cuba", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'CV', alpha3: 'CPV', name: "Cape Verde", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'CW', alpha3: 'CUW', name: "Curaçao", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'CX', alpha3: 'CXR', name: "Christmas Island", region: 'Oceania', subregion: "Australia and New Zealand" },
  { code: 'CY', alpha3: 'CYP', name: "Cyprus", region: 'Asia', subregion: "Western Asia" },
  { code: 'CZ', alpha3: 'CZE', name: "Czech Republic", region: 'Europe', subregion: "Eastern Europe" },
  { code: 'DE', alpha3: 'DEU', name: "Germany", region: 'Europe', subregion: "Western Europe" },
  { code: 'DJ', alpha3: 'DJI', name: "Djibouti", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'DK', alpha3: 'DNK', name: "Denmark", region: 'Europe', subregion: "Northern Europe" },
  { code: 'DM', alpha3: 'DMA', name: "Dominica", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'DO', alpha3: 'DOM', name: "Dominican Republic", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'DZ', alpha3: 'DZA', name: "Algeria", region: 'Africa', subregion: "Northern Africa" },
  { code: 'EC', alpha3: 'ECU', name: "Ecuador", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'EE', alpha3: 'EST', name: "Estonia", region: 'Europe', subregion: "Northern Europe" },
  { code: 'EG', alpha3: 'EGY', name: "Egypt", region: 'Africa', subregion: "Northern Africa" },
  { code: 'EH', alpha3: 'ESH', name: "Western Sahara", region: 'Africa', subregion: "Northern Africa" },
  { code: 'ER', alpha3: 'ERI', name: "Eritrea", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'ES', alpha3: 'ESP', name: "Spain", region: 'Europe', subregion: "Southern Europe" },
  { code: 'ET', alpha3: 'ETH', name: "Ethiopia", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'FI', alpha3: 'FIN', name: "Finland", region: 'Europe', subregion: "Northern Europe" },
  { code: 'FJ', alpha3: 'FJI', name: "Fiji", region: 'Oceania', subregion: "Melanesia" },
  { code: 'FK', alpha3: 'FLK', name: "Falkland Islands", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'FM', alpha3: 'FSM', name: "Micronesia", region: 'Oceania', subregion: "Micronesia" },
  { code: 'FO', alpha3: 'FRO', name: "Faroe Islands", region: 'Europe', subregion: "Northern Europe" },
  { code: 'FR', alpha3: 'FRA', name: "France", region: 'Europe', subregion: "Western Europe" },
  { code: 'GA', alpha3: 'GAB', name: "Gabon", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'GB', alpha3: 'GBR', name: "United Kingdom", region: 'Europe', subregion: "Northern Europe" },
  { code: 'GD', alpha3: 'GRD', name: "Grenada", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'GE', alpha3: 'GEO', name: "Georgia", region: 'Asia', subregion: "Western Asia" },
  { code: 'GF', alpha3: 'GUF', name: "French Guiana", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'GG', alpha3: 'GGY', name: "Guernsey", region: 'Europe', subregion: "Northern Europe" },
  { code: 'GH', alpha3: 'GHA', name: "Ghana", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'GI', alpha3: 'GIB', name: "Gibraltar", region: 'Europe', subregion: "Southern Europe" },
  { code: 'GL', alpha3: 'GRL', name: "Greenland", region: 'Americas', subregion: "Northern America" },
  { code: 'GM', alpha3: 'GMB', name: "Gambia", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'GN', alpha3: 'GIN', name: "Guinea", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'GP', alpha3: 'GLP', name: "Guadeloupe", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'GQ', alpha3: 'GNQ', name: "Equatorial Guinea", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'GR', alpha3: 'GRC', name: "Greece", region: 'Europe', subregion: "Southern Europe" },
  { code: 'GS', alpha3: 'SGS', name: "South Georgia and the South Sandwich Islands", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'GT', alpha3: 'GTM', name: "Guatemala", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'GU', alpha3: 'GUM', name: "Guam", region: 'Oceania', subregion: "Micronesia" },
  { code: 'GW', alpha3: 'GNB', name: "Guinea-Bissau", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'GY', alpha3: 'GUY', name: "Guyana", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'HK', alpha3: 'HKG', name: "Hong Kong", region: 'Asia', subregion: "Eastern Asia" },
  { code: 'HM', alpha3: 'HMD', name: "Heard Island and McDonald Islands", region: 'Oceania', subregion: "Australia and New Zealand" },
  { code: 'HN', alpha3: 'HND', name: "Honduras", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'HR', alpha3: 'HRV', name: "Croatia", region: 'Europe', subregion: "Southern Europe" },
  { code: 'HT', alpha3: 'HTI', name: "Haiti", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'HU', alpha3: 'HUN', name: "Hungary", region: 'Europe', subregion: "Eastern Europe" },
  { code: 'ID', alpha3: 'IDN', name: "Indonesia", region: 'Asia', subregion: "South-eastern Asia" },
  { code: 'IE', alpha3: 'IRL', name: "Ireland", region: 'Europe', subregion: "Northern Europe" },
  { code: 'IL', alpha3: 'ISR', name: "Israel", region: 'Asia', subregion: "Western Asia" },
  { code: 'IM', alpha3: 'IMN', name: "Isle of Man", region: 'Europe', subregion: "Northern Europe" },
  { code: 'IN', alpha3: 'IND', name: "India", region: 'Asia', subregion: "Southern Asia" },
  { code: 'IO', alpha3: 'IOT', name: "British Indian Ocean Territory", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'IQ', alpha3: 'IRQ', name: "Iraq", region: 'Asia', subregion: "Western Asia" },
  { code: 'IR', alpha3: 'IRN', name: "Iran", region: 'Asia', subregion: "Southern Asia" },
  { code: 'IS', alpha3: 'ISL', name: "Iceland", region: 'Europe', subregion: "Northern Europe" },
  { code: 'IT', alpha3: 'ITA', name: "Italy", region: 'Europe', subregion: "Southern Europe" },
  { code: 'JE', alpha3: 'JEY', name: "Jersey", region: 'Europe', subregion: "Northern Europe" },
  { code: 'JM', alpha3: 'JAM', name: "Jamaica", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'JO', alpha3: 'JOR', name: "Jordan", region: 'Asia', subregion: "Western Asia" },
  { code: 'JP', alpha3: 'JPN', name: "Japan", region: 'Asia', subregion: "Eastern Asia" },
  { code: 'KE', alpha3: 'KEN', name: "Kenya", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'KG', alpha3: 'KGZ', name: "Kyrgyzstan", region: 'Asia', subregion: "Central Asia" },
  { code: 'KH', alpha3: 'KHM', name: "Cambodia", region: 'Asia', subregion: "South-eastern Asia" },
  { code: 'KI', alpha3: 'KIR', name: "Kiribati", region: 'Oceania', subregion: "Micronesia" },
  { code: 'KM', alpha3: 'COM', name: "Comoros", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'KN', alpha3: 'KNA', name: "Saint Kitts and Nevis", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'KP', alpha3: 'PRK', name: "North Korea", region: 'Asia', subregion: "Eastern Asia" },
  { code: 'KR', alpha3: 'KOR', name: "South Korea", region: 'Asia', subregion: "Eastern Asia" },
  { code: 'KW', alpha3: 'KWT', name: "Kuwait", region: 'Asia', subregion: "Western Asia" },
  { code: 'KY', alpha3: 'CYM', name: "Cayman Islands", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'KZ', alpha3: 'KAZ', name: "Kazakhstan", region: 'Asia', subregion: "Central Asia" },
  { code: 'LA', alpha3: 'LAO', name: "Laos", region: 'Asia', subregion: "South-eastern Asia" },
  { code: 'LB', alpha3: 'LBN', name: "Lebanon", region: 'Asia', subregion: "Western Asia" },
  { code: 'LC', alpha3: 'LCA', name: "Saint Lucia", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'LI', alpha3: 'LIE', name: "Liechtenstein", region: 'Europe', subregion: "Western Europe" },
  { code: 'LK', alpha3: 'LKA', name: "Sri Lanka", region: 'Asia', subregion: "Southern Asia" },
  { code: 'LR', alpha3: 'LBR', name: "Liberia", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'LS', alpha3: 'LSO', name: "Lesotho", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'LT', alpha3: 'LTU', name: "Lithuania", region: 'Europe', subregion: "Northern Europe" },
  { code: 'LU', alpha3: 'LUX', name: "Luxembourg", region: 'Europe', subregion: "Western Europe" },
  { code: 'LV', alpha3: 'LVA', name: "Latvia", region: 'Europe', subregion: "Northern Europe" },
  { code: 'LY', alpha3: 'LBY', name: "Libya", region: 'Africa', subregion: "Northern Africa" },
  { code: 'MA', alpha3: 'MAR', name: "Morocco", region: 'Africa', subregion: "Northern Africa" },
  { code: 'MC', alpha3: 'MCO', name: "Monaco", region: 'Europe', subregion: "Western Europe" },
  { code: 'MD', alpha3: 'MDA', name: "Moldova", region: 'Europe', subregion: "Eastern Europe" },
  { code: 'ME', alpha3: 'MNE', name: "Montenegro", region: 'Europe', subregion: "Southern Europe" },
  { code: 'MF', alpha3: 'MAF', name: "Saint Martin (French part)", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'MG', alpha3: 'MDG', name: "Madagascar", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'MH', alpha3: 'MHL', name: "Marshall Islands", region: 'Oceania', subregion: "Micronesia" },
  { code: 'MK', alpha3: 'MKD', name: "North Macedonia", region: 'Europe', subregion: "Southern Europe" },
  { code: 'ML', alpha3: 'MLI', name: "Mali", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'MM', alpha3: 'MMR', name: "Myanmar", region: 'Asia', subregion: "South-eastern Asia" },
  { code: 'MN', alpha3: 'MNG', name: "Mongolia", region: 'Asia', subregion: "Eastern Asia" },
  { code: 'MO', alpha3: 'MAC', name: "Macao", region: 'Asia', subregion: "Eastern Asia" },
  { code: 'MP', alpha3: 'MNP', name: "Northern Mariana Islands", region: 'Oceania', subregion: "Micronesia" },
  { code: 'MQ', alpha3: 'MTQ', name: "Martinique", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'MR', alpha3: 'MRT', name: "Mauritania", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'MS', alpha3: 'MSR', name: "Montserrat", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'MT', alpha3: 'MLT', name: "Malta", region: 'Europe', subregion: "Southern Europe" },
  { code: 'MU', alpha3: 'MUS', name: "Mauritius", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'MV', alpha3: 'MDV', name: "Maldives", region: 'Asia', subregion: "Southern Asia" },
  { code: 'MW', alpha3: 'MWI', name: "Malawi", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'MX', alpha3: 'MEX', name: "Mexico", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'MY', alpha3: 'MYS', name: "Malaysia", region: 'Asia', subregion: "South-eastern Asia" },
  { code: 'MZ', alpha3: 'MOZ', name: "Mozambique", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'NA', alpha3: 'NAM', name: "Namibia", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'NC', alpha3: 'NCL', name: "New Caledonia", region: 'Oceania', subregion: "Melanesia" },
  { code: 'NE', alpha3: 'NER', name: "Niger", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'NF', alpha3: 'NFK', name: "Norfolk Island", region: 'Oceania', subregion: "Australia and New Zealand" },
  { code: 'NG', alpha3: 'NGA', name: "Nigeria", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'NI', alpha3: 'NIC', name: "Nicaragua", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'NL', alpha3: 'NLD', name: "Netherlands", region: 'Europe', subregion: "Western Europe" },
  { code: 'NO', alpha3: 'NOR', name: "Norway", region: 'Europe', subregion: "Northern Europe" },
  { code: 'NP', alpha3: 'NPL', name: "Nepal", region: 'Asia', subregion: "Southern Asia" },
  { code: 'NR', alpha3: 'NRU', name: "Nauru", region: 'Oceania', subregion: "Micronesia" },
  { code: 'NU', alpha3: 'NIU', name: "Niue", region: 'Oceania', subregion: "Polynesia" },
  { code: 'NZ', alpha3: 'NZL', name: "New Zealand", region: 'Oceania', subregion: "Australia and New Zealand" },
  { code: 'OM', alpha3: 'OMN', name: "Oman", region: 'Asia', subregion: "Western Asia" },
  { code: 'PA', alpha3: 'PAN', name: "Panama", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'PE', alpha3: 'PER', name: "Peru", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'PF', alpha3: 'PYF', name: "French Polynesia", region: 'Oceania', subregion: "Polynesia" },
  { code: 'PG', alpha3: 'PNG', name: "Papua New Guinea", region: 'Oceania', subregion: "Melanesia" },
  { code: 'PH', alpha3: 'PHL', name: "Philippines", region: 'Asia', subregion: "South-eastern Asia" },
  { code: 'PK', alpha3: 'PAK', name: "Pakistan", region: 'Asia', subregion: "Southern Asia" },
  { code: 'PL', alpha3: 'POL', name: "Poland", region: 'Europe', subregion: "Eastern Europe" },
  { code: 'PM', alpha3: 'SPM', name: "Saint Pierre and Miquelon", region: 'Americas', subregion: "Northern America" },
  { code: 'PN', alpha3: 'PCN', name: "Pitcairn Islands", region: 'Oceania', subregion: "Polynesia" },
  { code: 'PR', alpha3: 'PRI', name: "Puerto Rico", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'PS', alpha3: 'PSE', name: "Palestine", region: 'Asia', subregion: "Western Asia" },
  { code: 'PT', alpha3: 'PRT', name: "Portugal", region: 'Europe', subregion: "Southern Europe" },
  { code: 'PW', alpha3: 'PLW', name: "Palau", region: 'Oceania', subregion: "Micronesia" },
  { code: 'PY', alpha3: 'PRY', name: "Paraguay", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'QA', alpha3: 'QAT', name: "Qatar", region: 'Asia', subregion: "Western Asia" },
  { code: 'RE', alpha3: 'REU', name: "Réunion", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'RO', alpha3: 'ROU', name: "Romania", region: 'Europe', subregion: "Eastern Europe" },
  { code: 'RS', alpha3: 'SRB', name: "Serbia", region: 'Europe', subregion: "Southern Europe" },
  { code: 'RU', alpha3: 'RUS', name: "Russia", region: 'Europe', subregion: "Eastern Europe" },
  { code: 'RW', alpha3: 'RWA', name: "Rwanda", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'SA', alpha3: 'SAU', name: "Saudi Arabia", region: 'Asia', subregion: "Western Asia" },
  { code: 'SB', alpha3: 'SLB', name: "Solomon Islands", region: 'Oceania', subregion: "Melanesia" },
  { code: 'SC', alpha3: 'SYC', name: "Seychelles", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'SD', alpha3: 'SDN', name: "Sudan", region: 'Africa', subregion: "Northern Africa" },
  { code: 'SE', alpha3: 'SWE', name: "Sweden", region: 'Europe', subregion: "Northern Europe" },
  { code: 'SG', alpha3: 'SGP', name: "Singapore", region: 'Asia', subregion: "South-eastern Asia" },
  { code: 'SH', alpha3: 'SHN', name: "Saint Helena", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'SI', alpha3: 'SVN', name: "Slovenia", region: 'Europe', subregion: "Southern Europe" },
  { code: 'SJ', alpha3: 'SJM', name: "Svalbard and Jan Mayen", region: 'Europe', subregion: "Northern Europe" },
  { code: 'SK', alpha3: 'SVK', name: "Slovakia", region: 'Europe', subregion: "Eastern Europe" },
  { code: 'SL', alpha3: 'SLE', name: "Sierra Leone", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'SM', alpha3: 'SMR', name: "San Marino", region: 'Europe', subregion: "Southern Europe" },
  { code: 'SN', alpha3: 'SEN', name: "Senegal", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'SO', alpha3: 'SOM', name: "Somalia", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'SR', alpha3: 'SUR', name: "Suriname", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'SS', alpha3: 'SSD', name: "South Sudan", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'ST', alpha3: 'STP', name: "São Tomé and Príncipe", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'SV', alpha3: 'SLV', name: "El Salvador", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'SX', alpha3: 'SXM', name: "Sint Maarten", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'SY', alpha3: 'SYR', name: "Syria", region: 'Asia', subregion: "Western Asia" },
  { code: 'SZ', alpha3: 'SWZ', name: "Eswatini", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'TC', alpha3: 'TCA', name: "Turks and Caicos Islands", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'TD', alpha3: 'TCD', name: "Chad", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'TF', alpha3: 'ATF', name: "French Southern Territories", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'TG', alpha3: 'TGO', name: "Togo", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'TH', alpha3: 'THA', name: "Thailand", region: 'Asia', subregion: "South-eastern Asia" },
  { code: 'TJ', alpha3: 'TJK', name: "Tajikistan", region: 'Asia', subregion: "Central Asia" },
  { code: 'TK', alpha3: 'TKL', name: "Tokelau", region: 'Oceania', subregion: "Polynesia" },
  { code: 'TL', alpha3: 'TLS', name: "East Timor", region: 'Asia', subregion: "South-eastern Asia" },
  { code: 'TM', alpha3: 'TKM', name: "Turkmenistan", region: 'Asia', subregion: "Central Asia" },
  { code: 'TN', alpha3: 'TUN', name: "Tunisia", region: 'Africa', subregion: "Northern Africa" },
  { code: 'TO', alpha3: 'TON', name: "Tonga", region: 'Oceania', subregion: "Polynesia" },
  { code: 'TR', alpha3: 'TUR', name: "Turkey", region: 'Asia', subregion: "Western Asia" },
  { code: 'TT', alpha3: 'TTO', name: "Trinidad and Tobago", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'TV', alpha3: 'TUV', name: "Tuvalu", region: 'Oceania', subregion: "Polynesia" },
  { code: 'TW', alpha3: 'TWN', name: "Taiwan", region: 'Other', subregion: "" },
  { code: 'TZ', alpha3: 'TZA', name: "Tanzania", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'UA', alpha3: 'UKR', name: "Ukraine", region: 'Europe', subregion: "Eastern Europe" },
  { code: 'UG', alpha3: 'UGA', name: "Uganda", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'UM', alpha3: 'UMI', name: "U.S. Minor Outlying Islands", region: 'Oceania', subregion: "Micronesia" },
  { code: 'US', alpha3: 'USA', name: "United States", region: 'Americas', subregion: "Northern America" },
  { code: 'UY', alpha3: 'URY', name: "Uruguay", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'UZ', alpha3: 'UZB', name: "Uzbekistan", region: 'Asia', subregion: "Central Asia" },
  { code: 'VA', alpha3: 'VAT', name: "Vatican City", region: 'Europe', subregion: "Southern Europe" },
  { code: 'VC', alpha3: 'VCT', name: "Saint Vincent and the Grenadines", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'VE', alpha3: 'VEN', name: "Venezuela", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'VG', alpha3: 'VGB', name: "British Virgin Islands", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'VI', alpha3: 'VIR', name: "U.S. Virgin Islands", region: 'Americas', subregion: "Latin America and the Caribbean" },
  { code: 'VN', alpha3: 'VNM', name: "Vietnam", region: 'Asia', subregion: "South-eastern Asia" },
  { code: 'VU', alpha3: 'VUT', name: "Vanuatu", region: 'Oceania', subregion: "Melanesia" },
  { code: 'WF', alpha3: 'WLF', name: "Wallis and Futuna", region: 'Oceania', subregion: "Polynesia" },
  { code: 'WS', alpha3: 'WSM', name: "Samoa", region: 'Oceania', subregion: "Polynesia" },
  { code: 'YE', alpha3: 'YEM', name: "Yemen", region: 'Asia', subregion: "Western Asia" },
  { code: 'YT', alpha3: 'MYT', name: "Mayotte", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'ZA', alpha3: 'ZAF', name: "South Africa", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'ZM', alpha3: 'ZMB', name: "Zambia", region: 'Africa', subregion: "Sub-Saharan Africa" },
  { code: 'ZW', alpha3: 'ZWE', name: "Zimbabwe", region: 'Africa', subregion: "Sub-Saharan Africa" },
];

const BY_ALPHA2 = new Map(COUNTRIES.map(c => [c.code, c]));
const BY_ALPHA3 = new Map(COUNTRIES.map(c => [c.alpha3, c]));
const BY_NAME = new Map(COUNTRIES.map(c => [c.name.toLowerCase(), c]));

/**
 * Resolve an alpha-2 code, an alpha-3 code, or a country name to a Country.
 * Returns null when nothing matches — callers must handle untrusted input.
 */
export const resolveCountry = (input: string | null | undefined): Country | null => {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const upper = trimmed.toUpperCase();
  return (
    BY_ALPHA2.get(upper) ??
    BY_ALPHA3.get(upper) ??
    BY_NAME.get(trimmed.toLowerCase()) ??
    null
  );
};

// Countries and territories with no outline of their own on the jsvectormap
// world map — every ISO 3166-1 code the app supports that the map has no region
// for. They get a pin instead, shown only while that country is selected.
// Values are [lat, lng] of the territory's centre.
// ponytail: plain lookup table, derived once from the map's own region list.
// Antarctica is deliberately absent: it is missing from the map because the
// projection cuts it off, not because it is small.
export const SMALL_COUNTRY_MARKERS: Record<string, [number, number]> = {
  AD: [42.5000, 1.5000],        // Andorra
  AG: [17.0500, -61.8000],      // Antigua and Barbuda
  AI: [18.2500, -63.1667],      // Anguilla
  AS: [-14.3333, -170.0000],    // American Samoa
  AW: [12.5000, -69.9667],      // Aruba
  AX: [60.1167, 19.9000],       // Åland Islands
  BB: [13.1667, -59.5333],      // Barbados
  BH: [26.0000, 50.5500],       // Bahrain
  BL: [17.9000, -62.8333],      // Saint Barthélemy
  BM: [32.3333, -64.7500],      // Bermuda
  BQ: [12.1800, -68.2500],      // Bonaire, Sint Eustatius and Saba
  BV: [-54.4333, 3.4000],       // Bouvet Island
  CC: [-12.5000, 96.8333],      // Cocos (Keeling) Islands
  CK: [-21.2333, -159.7667],    // Cook Islands
  CV: [16.0000, -24.0000],      // Cape Verde
  CW: [12.1167, -68.9333],      // Curaçao
  CX: [-10.5000, 105.6667],     // Christmas Island
  DM: [15.4167, -61.3333],      // Dominica
  FM: [6.9167, 158.2500],       // Micronesia
  FO: [62.0000, -7.0000],       // Faroe Islands
  GD: [12.1167, -61.6667],      // Grenada
  GF: [4.0000, -53.0000],       // French Guiana
  GG: [49.4667, -2.5833],       // Guernsey
  GI: [36.1333, -5.3500],       // Gibraltar
  GP: [16.2500, -61.5833],      // Guadeloupe
  GS: [-54.5000, -37.0000],     // South Georgia and the South Sandwich Islands
  GU: [13.4667, 144.7833],      // Guam
  HK: [22.2670, 114.1880],      // Hong Kong
  HM: [-53.1000, 72.5167],      // Heard Island and McDonald Islands
  IM: [54.2500, -4.5000],       // Isle of Man
  IO: [-6.0000, 71.5000],       // British Indian Ocean Territory
  JE: [49.2500, -2.1667],       // Jersey
  KI: [1.4167, 173.0000],       // Kiribati
  KM: [-12.1667, 44.2500],      // Comoros
  KN: [17.3333, -62.7500],      // Saint Kitts and Nevis
  KY: [19.5000, -80.5000],      // Cayman Islands
  LC: [13.8833, -60.9667],      // Saint Lucia
  LI: [47.2667, 9.5333],        // Liechtenstein
  MC: [43.7333, 7.4000],        // Monaco
  MF: [18.0708, -63.0501],      // Saint Martin (French part)
  MH: [9.0000, 168.0000],       // Marshall Islands
  MO: [22.1667, 113.5500],      // Macao
  MP: [15.2000, 145.7500],      // Northern Mariana Islands
  MQ: [14.6667, -61.0000],      // Martinique
  MS: [16.7500, -62.2000],      // Montserrat
  MT: [35.8333, 14.5833],       // Malta
  MU: [-20.2833, 57.5500],      // Mauritius
  MV: [3.2500, 73.0000],        // Maldives
  NF: [-29.0333, 167.9500],     // Norfolk Island
  NR: [-0.5333, 166.9167],      // Nauru
  NU: [-19.0333, -169.8667],    // Niue
  PF: [-17.6797, -149.4068],    // French Polynesia (Tahiti)
  PM: [46.8333, -56.3333],      // Saint Pierre and Miquelon
  PN: [-25.0667, -130.1000],    // Pitcairn Islands
  PW: [7.5000, 134.5000],       // Palau
  RE: [-21.1500, 55.5000],      // Réunion
  SC: [-4.5833, 55.6667],       // Seychelles
  SG: [1.3667, 103.8000],       // Singapore
  SH: [-15.9500, -5.7200],      // Saint Helena
  SJ: [78.0000, 20.0000],       // Svalbard and Jan Mayen
  SM: [43.7667, 12.4167],       // San Marino
  ST: [0.3333, 6.7333],         // São Tomé and Príncipe
  SX: [18.0333, -63.0500],      // Sint Maarten
  TC: [21.7500, -71.5833],      // Turks and Caicos Islands
  TK: [-9.0000, -172.0000],     // Tokelau
  TO: [-20.0000, -175.0000],    // Tonga
  TV: [-8.0000, 178.0000],      // Tuvalu
  UM: [19.3000, 166.6333],      // U.S. Minor Outlying Islands
  VA: [41.9000, 12.4500],       // Vatican City
  VC: [13.2500, -61.2000],      // Saint Vincent and the Grenadines
  VG: [18.4314, -64.6231],      // British Virgin Islands
  VI: [18.3500, -64.9333],      // U.S. Virgin Islands
  WF: [-13.3000, -176.2000],    // Wallis and Futuna
  WS: [-13.5833, -172.3333],    // Samoa
  YT: [-12.8333, 45.1667],      // Mayotte
};
