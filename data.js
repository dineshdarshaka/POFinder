// data.js
let postOfficeData = JSON.parse(localStorage.getItem('postOfficeData')) || [
  {
    office_name: "Main Post Office",
    control_office: "0",
    num_sub_post_offices: 3,
    delivery_state: "D",
    dpmg_area: "Area 1",
    ds_area: "DS Area 1",
    postal_code: "123456",
    phone_number: "1234567890"
  },
  {
    office_name: "Sub Post Office 1",
    control_office: "Main Post Office",
    num_sub_post_offices: 0,
    delivery_state: "ND",
    dpmg_area: "Area 2",
    ds_area: "DS Area 2",
    postal_code: "654321",
    phone_number: "0987654321"
  },
  // Add more default data as needed
];