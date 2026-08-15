---
Task ID: 1
Agent: Main Agent
Task: Add "Manage options" inline popover to dropdown fields in Equipment Requisition form

Work Log:
- Analyzed uploaded UI mockup image showing "Manage options" icons highlighted next to dropdown fields
- Read existing DropdownWithManage component - found it had isAdmin prop but didn't use it
- Updated DropdownWithManage component to include:
  - Settings2 icon button next to each dropdown (visible only for admin users)
  - Popover with inline CRUD interface for managing dropdown options (add, edit, delete)
  - Delete confirmation dialog
  - Auto-refresh of dropdown options after add/edit/delete operations
- Build verified successfully

Stage Summary:
- DropdownWithManage now shows a "Manage options" gear icon next to Department, Branch, and Address dropdowns for admin users
- Clicking the icon opens an inline popover with add/edit/delete capabilities
- Non-admin users see only the standard dropdown without the manage icon
- Build compiles without errors
