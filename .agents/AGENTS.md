# Workspace Project Rules

## Navigation & Global Features
- **Ctrl + K Global Search**: Whenever creating or updating any new page, layout, view, or module, always ensure the global search functionality (`Ctrl + K` command palette / ERPNext AwesomeBar) is accessible and included on the page.

## Module Architecture & Navigation Rules
- **Standalone Master Data Setup Module**: Master Data Setup is a single-source standalone module (Company Setup, Site Setup, User Setup, Customer Creation, Supplier Setup, Item Setup, Dropdown Sub-Masters). Never duplicate or embed Master Data setup menus or configuration screens inside other business modules. Business modules reference master data records via select/lookup dropdown controls.
- **Contextual Module-Specific Sidebars**: When navigating into any active module (Master Data Setup, Stock Management, Purchasing, Sales & Distribution, Finance / Ledger, Part Creation), render ONLY that module's dedicated sub-menu items in the sidebar navigation. Always include a `Back to Launcher` option to return to the Home page cards.

## Documentation Standards
- **Functional Specification Documents (FSD)**: Whenever asked to create or draft a new Functional Specification Document (FSD), ALWAYS follow the Laxmico Ltd template structure. Ensure all fields from the system are captured. The document must be generated as a highly structured Microsoft Word `.docx` file (e.g. using a programmatic Python `python-docx` script) featuring:
  - Section 3 Functional Specifications formatted precisely as detailed, dark-blue headed tables.
  - Section 3.7 File Info & Document Management.
  - Section 3.8 Dispatch Address Info.
  - Section 3.9 Workflow History and Audit Trail.
  - Section 4 Non-functional Specifications comprehensively covering 4.1 through 4.14.
