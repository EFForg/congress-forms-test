define(['querystring'], function(qs) {
  // If this repo is private, feel throw to API KEY in source
  return {
    SUNLIGHT_API_KEY: qs.get().SUNLIGHT_API_KEY || '3d4faf1bbaf64fa4906c6d9f9ce8c2cc',
    CONTACT_CONGRESS_SERVER: 'http://ec2-54-215-28-56.us-west-1.compute.amazonaws.com:3000',
      
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
    ]
  }
});