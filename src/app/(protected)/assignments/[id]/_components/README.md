# Assignment Detail Page Components

This directory contains the refactored components for the assignment detail page.

## Refactoring Results

**Before**: Single monolithic file with 685 lines
**After**: 7 focused components with clear responsibilities

### Main Page

- **File**: `../page.tsx`
- **Lines**: 203 (70% reduction!)
- **Responsibility**: Orchestration, data fetching, and state management

## Structure

```
_components/
├── types.ts                          (68 lines)  - Shared TypeScript interfaces
├── AssignmentHeader.tsx              (77 lines)  - Title, status, submit button
├── AssignmentMetadata.tsx            (78 lines)  - Due date, grade, teacher info
├── AssignmentAttachmentsList.tsx     (106 lines) - Display assignment attachments
├── StudentFileUpload.tsx             (63 lines)  - File upload section for students
├── StudentSubmissionDisplay.tsx      (164 lines) - Show submitted work and grade
└── README.md                                     - This file
```

## Component Details

### types.ts

Shared TypeScript interfaces:

- `Assignment` - Complete assignment structure
- `AssignmentAttachment` - Attachment from teacher
- `StudentSubmission` - Student's submitted work
- `SubmissionAttachment` - Attachments in student submission
- `AllSubmission` - Submission data for teachers view

### AssignmentHeader.tsx

**Props**:

- `assignment` - Assignment data
- `userRole` - Current user's role
- `onSubmit` - Submit callback
- `isSubmitting` - Submission state
- `hasSelectedFile` - File selected flag

**Features**:

- Displays assignment title
- Shows status badge (Submitted/Overdue/Pending) for students
- Submit button for students (only if not submitted)
- Color-coded status indicators

### AssignmentMetadata.tsx

**Props**:

- `assignment` - Assignment data

**Features**:

- Due date display with icon
- Maximum grade display with icon
- Teacher information
- Week/Section information
- Subject information
- Description (if available)

### AssignmentAttachmentsList.tsx

**Props**:

- `attachments` - Array of attachments
- `file` - Main assignment file (legacy)
- `onFileView` - File view callback

**Features**:

- Displays main assignment file (if exists)
- Lists all attachments with titles
- File type indicators (File/Link)
- Open buttons for files
- External links for URLs
- Hover effects for better UX

### StudentFileUpload.tsx

**Props**:

- `selectedFile` - Currently selected file
- `onFileSelect` - File selection callback
- `onFileRemove` - File removal callback

**Features**:

- Green-themed upload area
- Shows selected file name and size
- Remove button for selected file
- Click to select interface
- Only visible for students before submission

### StudentSubmissionDisplay.tsx

**Props**:

- `submission` - Student submission data
- `maxGrade` - Maximum possible grade
- `onFileView` - File view callback
- `onDownload` - Download callback

**Features**:

- Displays submitted file with download button
- Shows submission date
- Image preview for image files
- Text content display (if provided)
- **Submission attachments list** (new feature!)
- Grade display with feedback
- Color-coded grade section

## New Features Added

1. **Assignment Attachments Display**
    - Shows all attachments added by teacher
    - Supports both file and link types
    - Click to open files or links

2. **Student Submission Attachments**
    - Displays attachments submitted by student
    - Consistent UI with assignment attachments

3. **Full Internationalization**
    - 27 translation keys added
    - Supports English, Russian, Kazakh
    - All hardcoded strings replaced

## Translation Keys

All text uses `assignmentPage.*` namespace:

- `loadingError`, `assignmentNotFound`
- `teacher`, `week`, `subject`
- `dueDate`, `maxGrade`, `points`
- `submitted`, `overdue`, `pending`
- `submit`, `submitting`
- `attachFile`, `submittedWork`
- `clickToSelect`, `remove`, `open`, `download`
- `textPart`, `grade`, `submittedOn`
- `attachments`, `submissionAttachments`
- `fileType`, `linkType`

## Benefits

1. **Maintainability**: Each component is 63-164 lines vs 685
2. **Testability**: Isolated components easier to unit test
3. **Reusability**: Components can be used in other contexts
4. **Type Safety**: Centralized types prevent inconsistencies
5. **Developer Experience**: Much easier to navigate and modify
6. **Internationalization**: Full support for 3 languages

## Usage Example

The main page now simply orchestrates components:

```tsx
<div className="container mx-auto px-4 py-8">
    <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
            <AssignmentHeader {...} />
            <AssignmentMetadata {...} />
            <AssignmentAttachmentsList {...} />
        </div>

        {/* Conditional sections based on user role */}
        {userRole === 'student' && !submitted && (
            <StudentFileUpload {...} />
        )}

        {userRole === 'student' && submitted && (
            <StudentSubmissionDisplay {...} />
        )}

        {userRole === 'teacher' && (
            <SubmissionsTable {...} />
        )}
    </div>
</div>
```

## Migration Notes

- No breaking changes to URL structure or routing
- All functionality preserved and enhanced
- Attachments now fully supported
- All text internationalized
- Build compiles successfully
- Zero linting errors
