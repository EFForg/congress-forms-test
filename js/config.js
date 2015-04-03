define(['querystring'], function(qs) {
  // If this repo is private, feel throw to API KEY in source
  return {
    SUNLIGHT_API_KEY: qs.get().SUNLIGHT_API_KEY || '3d4faf1bbaf64fa4906c6d9f9ce8c2cc',
    PHANTOM_DC_SERVER: qs.get().phantom_dc_server || 'https://congressforms.eff.org/',
    GITHUB_YAML_DIR: 'https://github.com/unitedstates/contact-congress/blob/master/members/',
    DEBUG_KEY: qs.get().debug_key || '',
      
    // Default fields for form

    DEFAULT_FIELDS: [
      {
        name: '$NAME_FIRST',
        label: 'First Name'
      },
      {
        name: '$NAME_LAST',
        label: 'Last Name'
      },
      {
        name: '$ADDRESS_STREET',
        label: 'Street Address'
      },
      {
        name: '$ADDRESS_STREET_2',
        label: 'Street Address 2'
      },
      {
        name: '$ADDRESS_CITY',
        label: 'City'
      },
      {
        name: '$ADDRESS_ZIP5',
        label: 'Zip'
      },
      {
        name: '$EMAIL',
        label: 'Email'
      },
      {
        name: '$MESSAGE',
        label: 'Message',
        type: 'textarea'
      }
    ],
    // TODO - merge with above array
    // This data is now legacy, but will keep for now as a fallback
    EXAMPLE_DATA: [
      {
        name: '$NAME_FIRST',
        example: 'Joe'
      },
      {
        name: '$NAME_LAST',
        example: 'Blogs'
      },
      {
        name: '$ADDRESS_STREET',
        example: '120 Test Avenue'
      },
      {
        name: '$ADDRESS_STREET_2',
        example: 'Unit 404'
      },
      {
        name: '$ADDRESS_CITY',
        example: 'Test City'
      },
      {
        name: '$EMAIL',
        example: 'joeblogs@testcity.com'
      },
      {
        name: '$MESSAGE',
        example: 'Hello, this is a test'
      },
      {
        name: '$SUBJECT',
        example: 'Subject: Test'
      },
      {
        name: '$NAME_PREFIX',
        example: 'Mr'
      },
      {
        name: '$PHONE',
        example: '(111) 111-1111'
      }
    ],
    STATES: [
    { name: 'ALABAMA', value: 'AL'},
    { name: 'ALASKA', value: 'AK'},
    { name: 'AMERICAN SAMOA', value: 'AS'},
    { name: 'ARIZONA', value: 'AZ'},
    { name: 'ARKANSAS', value: 'AR'},
    { name: 'CALIFORNIA', value: 'CA'},
    { name: 'COLORADO', value: 'CO'},
    { name: 'CONNECTICUT', value: 'CT'},
    { name: 'DELAWARE', value: 'DE'},
    { name: 'DISTRICT OF COLUMBIA', value: 'DC'},
    { name: 'FEDERATED STATES OF MICRONESIA', value: 'FM'},
    { name: 'FLORIDA', value: 'FL'},
    { name: 'GEORGIA', value: 'GA'},
    { name: 'GUAM', value: 'GU'},
    { name: 'HAWAII', value: 'HI'},
    { name: 'IDAHO', value: 'ID'},
    { name: 'ILLINOIS', value: 'IL'},
    { name: 'INDIANA', value: 'IN'},
    { name: 'IOWA', value: 'IA'},
    { name: 'KANSAS', value: 'KS'},
    { name: 'KENTUCKY', value: 'KY'},
    { name: 'LOUISIANA', value: 'LA'},
    { name: 'MAINE', value: 'ME'},
    { name: 'MARSHALL ISLANDS', value: 'MH'},
    { name: 'MARYLAND', value: 'MD'},
    { name: 'MASSACHUSETTS', value: 'MA'},
    { name: 'MICHIGAN', value: 'MI'},
    { name: 'MINNESOTA', value: 'MN'},
    { name: 'MISSISSIPPI', value: 'MS'},
    { name: 'MISSOURI', value: 'MO'},
    { name: 'MONTANA', value: 'MT'},
    { name: 'NEBRASKA', value: 'NE'},
    { name: 'NEVADA', value: 'NV'},
    { name: 'NEW HAMPSHIRE', value: 'NH'},
    { name: 'NEW JERSEY', value: 'NJ'},
    { name: 'NEW MEXICO', value: 'NM'},
    { name: 'NEW YORK', value: 'NY'},
    { name: 'NORTH CAROLINA', value: 'NC'},
    { name: 'NORTH DAKOTA', value: 'ND'},
    { name: 'NORTHERN MARIANA ISLANDS', value: 'MP'},
    { name: 'OHIO', value: 'OH'},
    { name: 'OKLAHOMA', value: 'OK'},
    { name: 'OREGON', value: 'OR'},
    { name: 'PALAU', value: 'PW'},
    { name: 'PENNSYLVANIA', value: 'PA'},
    { name: 'PUERTO RICO', value: 'PR'},
    { name: 'RHODE ISLAND', value: 'RI'},
    { name: 'SOUTH CAROLINA', value: 'SC'},
    { name: 'SOUTH DAKOTA', value: 'SD'},
    { name: 'TENNESSEE', value: 'TN'},
    { name: 'TEXAS', value: 'TX'},
    { name: 'UTAH', value: 'UT'},
    { name: 'VERMONT', value: 'VT'},
    { name: 'VIRGIN ISLANDS', value: 'VI'},
    { name: 'VIRGINIA', value: 'VA'},
    { name: 'WASHINGTON', value: 'WA'},
    { name: 'WEST VIRGINIA', value: 'WV'},
    { name: 'WISCONSIN', value: 'WI'},
    { name: 'WYOMING', value: 'WY' }
  ]
  }
});
