# Translations Documentation

## Overview

All components in the CourseSectionAddItemModal system now support 3 languages:

- English (en)
- Russian (ru)
- Kazakh (kk)

## Translation Keys Added

Total: **49 translation keys** under `courseSectionModal` namespace

### Main Modal

- `title` - Modal title
- `resource` - Resource tab label
- `assignment` - Assignment tab label

### Form Labels

- `titleLabel` - Title label
- `titleRequired` - Title with asterisk
- `descriptionLabel` - Description label
- `dueDate` - Due date label
- `maxGrade` - Max grade label
- `resourceType` - Resource type selector label

### Attachments

- `attachments` - Attachments section title
- `addAttachment` - Add attachment button
- `attachmentRequirement` - Helper text for requirements
- `attachmentTitle` - Attachment title placeholder
- `selectFile` - File selection label
- `urlLabel` - URL label
- `remove` - Remove button
- `file` - File option
- `link` - Link option

### Placeholders

- `urlPlaceholder` - Generic URL placeholder
- `meetPlaceholder` - Google Meet URL placeholder
- `enterResourceTitle` - Resource title input placeholder
- `enterAssignmentTitle` - Assignment title input placeholder
- `enterAssignmentDescription` - Assignment description placeholder

### Actions

- `cancel` - Cancel button
- `createResource` - Create resource button
- `createAssignment` - Create assignment button
- `creating` - Creating... button state

### File Upload

- `clickToUpload` - Click to upload text
- `dragAndDrop` - Drag and drop text
- `clickToAttach` - Click to attach files text
- `maxFiles` - Max files text
- `selectedFiles` - Selected files label
- `selected` - Selected label
- `noFileSelected` - No file selected warning
- `maxFilesAllowed` - Maximum files error message
- `attachFilesOptional` - Attach files optional label

### Success Messages

- `resourceCreatedSuccess` - Resource created successfully
- `assignmentCreatedSuccess` - Assignment created successfully
- `assignmentWithAttachmentsSuccess` - Assignment with attachments success (with {count} param)
- `assignmentPartialSuccess` - Partial success message (with {successful}, {total} params)
- `assignmentAttachmentsFailed` - All attachments failed message
- `someAttachmentsFailed` - Some attachments failed (with {errors} param)
- `attachmentErrors` - Attachment errors (with {errors} param)

### Error Messages

- `failedToCreateResource` - Failed to create resource
- `failedToCreateAssignment` - Failed to create assignment
- `urlRequired` - URL required validation
- `validationAttachmentTitle` - Title required (with {num} param)
- `validationAttachmentFile` - File required (with {num}, {title} params)
- `validationAttachmentUrl` - URL required (with {num}, {title} params)

## Components Using Translations

### CourseSectionAddItemModal.tsx

```typescript
const { t } = useLocale();
<span>{t('courseSectionModal.resource')}</span>
```

### ResourceForm.tsx

```typescript
const { t } = useLocale();
onSuccess(t('courseSectionModal.resourceCreatedSuccess'));
```

### AssignmentForm.tsx

```typescript
const { t } = useLocale();
t('courseSectionModal.validationAttachmentTitle', { num: 1 });
t('courseSectionModal.assignmentWithAttachmentsSuccess', { count: 3 });
```

### AttachmentManager.tsx

```typescript
const { t } = useLocale();
<label>{t('courseSectionModal.attachments')}</label>
```

## Parameter Usage Examples

Some translations use parameters for dynamic content:

```typescript
// Simple parameter
t('courseSectionModal.validationAttachmentTitle', { num: 1 });
// Output: "Attachment 1: Title is required"

// Multiple parameters
t('courseSectionModal.validationAttachmentFile', {
    num: 2,
    title: 'My Document',
});
// Output: "Attachment 2 ("My Document"): File is required"

// Count parameter
t('courseSectionModal.assignmentWithAttachmentsSuccess', { count: 5 });
// Output: "Assignment and 5 attachment(s) created successfully!"
```

## Language Files Updated

1. **en.json** - English translations (default)
2. **ru.json** - Russian translations (Русский)
3. **kk.json** - Kazakh translations (Қазақша)

All files validated and contain proper JSON structure.

## Benefits

- Users can switch languages seamlessly
- All UI text is centralized in translation files
- Easy to add new languages in the future
- Consistent terminology across the application
- Dynamic messages with parameter support
