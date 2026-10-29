// Upload file to hidden input via DataTransfer
const fileInput = document.querySelectorAll('input[type=file]')[0];
const fileContent = `{"exportedAt":"2026-10-29T08:00:00.000Z","app":"ASR GROUP","count":2,"users":[{"name":"Import Test User 1","email":"importtest1@asrgroup.test","password":"testpass1","phone":"01700000001","employeeId":"TEST-IMP-001","department":"Information Technology","branch":"Head Office","role":"User","status":"Active"},{"name":"Import Test User 2","email":"importtest2@asrgroup.test","password":"testpass2","phone":"01700000002","employeeId":"TEST-IMP-002","department":"Accounts","branch":"Dhanmondi Branch","role":"User","status":"Active"}]}`;
const blob = new Blob([fileContent], { type: 'application/json' });
const file = new File([blob], 'test-import-users.json', { type: 'application/json' });
const dataTransfer = new DataTransfer();
dataTransfer.items.add(file);
fileInput.files = dataTransfer.files;
fileInput.dispatchEvent(new Event('change', { bubbles: true }));
'uploaded'
