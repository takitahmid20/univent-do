// lib/data/bangladesh-districts.js
export const bangladeshDistricts = [
    // Dhaka Division
    { id: 1, name: 'Dhaka', division: 'Dhaka' },
    { id: 2, name: 'Gazipur', division: 'Dhaka' },
    { id: 3, name: 'Narayanganj', division: 'Dhaka' },
    { id: 4, name: 'Tangail', division: 'Dhaka' },
    { id: 5, name: 'Narsingdi', division: 'Dhaka' },
    { id: 6, name: 'Faridpur', division: 'Dhaka' },
    { id: 7, name: 'Gopalganj', division: 'Dhaka' },
    { id: 8, name: 'Kishoreganj', division: 'Dhaka' },
    { id: 9, name: 'Madaripur', division: 'Dhaka' },
    { id: 10, name: 'Manikganj', division: 'Dhaka' },
    { id: 11, name: 'Munshiganj', division: 'Dhaka' },
    { id: 12, name: 'Rajbari', division: 'Dhaka' },
    { id: 13, name: 'Shariatpur', division: 'Dhaka' },
  
    // Chittagong Division
    { id: 14, name: 'Chittagong', division: 'Chittagong' },
    { id: 15, name: "Cox's Bazar", division: 'Chittagong' },
    { id: 16, name: 'Bandarban', division: 'Chittagong' },
    { id: 17, name: 'Rangamati', division: 'Chittagong' },
    { id: 18, name: 'Khagrachhari', division: 'Chittagong' },
    { id: 19, name: 'Feni', division: 'Chittagong' },
    { id: 20, name: 'Lakshmipur', division: 'Chittagong' },
    { id: 21, name: 'Noakhali', division: 'Chittagong' },
    { id: 22, name: 'Brahmanbaria', division: 'Chittagong' },
    { id: 23, name: 'Chandpur', division: 'Chittagong' },
    { id: 24, name: 'Cumilla', division: 'Chittagong' },
  
    // Rajshahi Division
    { id: 25, name: 'Rajshahi', division: 'Rajshahi' },
    { id: 26, name: 'Bogura', division: 'Rajshahi' },
    { id: 27, name: 'Chapainawabganj', division: 'Rajshahi' },
    { id: 28, name: 'Joypurhat', division: 'Rajshahi' },
    { id: 29, name: 'Naogaon', division: 'Rajshahi' },
    { id: 30, name: 'Natore', division: 'Rajshahi' },
    { id: 31, name: 'Pabna', division: 'Rajshahi' },
    { id: 32, name: 'Sirajganj', division: 'Rajshahi' },
  
    // Khulna Division
    { id: 33, name: 'Khulna', division: 'Khulna' },
    { id: 34, name: 'Bagerhat', division: 'Khulna' },
    { id: 35, name: 'Chuadanga', division: 'Khulna' },
    { id: 36, name: 'Jessore', division: 'Khulna' },
    { id: 37, name: 'Jhenaidah', division: 'Khulna' },
    { id: 38, name: 'Kushtia', division: 'Khulna' },
    { id: 39, name: 'Magura', division: 'Khulna' },
    { id: 40, name: 'Meherpur', division: 'Khulna' },
    { id: 41, name: 'Narail', division: 'Khulna' },
    { id: 42, name: 'Satkhira', division: 'Khulna' },
  
    // Barisal Division
    { id: 43, name: 'Barisal', division: 'Barisal' },
    { id: 44, name: 'Barguna', division: 'Barisal' },
    { id: 45, name: 'Bhola', division: 'Barisal' },
    { id: 46, name: 'Jhalokati', division: 'Barisal' },
    { id: 47, name: 'Patuakhali', division: 'Barisal' },
    { id: 48, name: 'Pirojpur', division: 'Barisal' },
  
    // Sylhet Division
    { id: 49, name: 'Sylhet', division: 'Sylhet' },
    { id: 50, name: 'Habiganj', division: 'Sylhet' },
    { id: 51, name: 'Moulvibazar', division: 'Sylhet' },
    { id: 52, name: 'Sunamganj', division: 'Sylhet' },
  
    // Rangpur Division
    { id: 53, name: 'Rangpur', division: 'Rangpur' },
    { id: 54, name: 'Dinajpur', division: 'Rangpur' },
    { id: 55, name: 'Gaibandha', division: 'Rangpur' },
    { id: 56, name: 'Kurigram', division: 'Rangpur' },
    { id: 57, name: 'Lalmonirhat', division: 'Rangpur' },
    { id: 58, name: 'Nilphamari', division: 'Rangpur' },
    { id: 59, name: 'Panchagarh', division: 'Rangpur' },
    { id: 60, name: 'Thakurgaon', division: 'Rangpur' },
  
    // Mymensingh Division
    { id: 61, name: 'Mymensingh', division: 'Mymensingh' },
    { id: 62, name: 'Jamalpur', division: 'Mymensingh' },
    { id: 63, name: 'Netrokona', division: 'Mymensingh' },
    { id: 64, name: 'Sherpur', division: 'Mymensingh' },
  ];
  
  // Optional: Export divisions separately if needed
  export const divisions = [
    'Dhaka',
    'Chittagong',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Sylhet',
    'Rangpur',
    'Mymensingh',
  ];
  
  // Optional: Get districts by division
  export const getDistrictsByDivision = (divisionName) => {
    return bangladeshDistricts.filter(district => district.division === divisionName);
  };