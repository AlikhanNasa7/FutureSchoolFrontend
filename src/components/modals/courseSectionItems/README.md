# CourseSectionItems Components

This directory contains the refactored components for adding course section items (resources and assignments).

## Structure

```
courseSectionItems/
├── types.ts                 (42 lines)  - Shared TypeScript interfaces
├── utils.ts                 (43 lines)  - Helper functions and utilities
├── AttachmentManager.tsx    (185 lines) - Manages assignment attachments
├── ResourceForm.tsx         (521 lines) - Resource creation form
├── AssignmentForm.tsx       (322 lines) - Assignment creation form
└── README.md                           - This file
```

## Refactoring Results

**Before**: Single monolithic file with 1,276 lines
**After**: 6 focused components with clear responsibilities

### Main Modal

- **File**: `../CourseSectionAddItemModal.tsx`
- **Lines**: 123 (90% reduction!)
- **Responsibility**: Orchestration, state management, and UI container

## Component Details

### types.ts

Shared TypeScript interfaces:

- `ItemType` - Resource or Assignment
- `ResourceType` - Various resource types
- `ResourceFormData` - Resource form state
- `AssignmentAttachment` - Attachment structure
- `AssignmentFormData` - Assignment form state
- `FormCallbacks` - Common callback interface

### utils.ts

Helper functions:

- `fileTypes` - Array of file-based resource types
- `getFileAcceptTypes()` - Returns accepted file types for input
- `isAttachmentValid()` - Validates attachment completeness

### AttachmentManager.tsx

**Props**:

- `attachments` - Array of attachments
- `onChange` - Update callback
- `attemptedSubmit` - Show validation errors flag
- `onErrorClear` - Clear errors callback

**Features**:

- Add/remove attachments
- Toggle file/link type
- Validation visual feedback
- Required field indicators

### ResourceForm.tsx

**Props**:

- `courseSectionId` - Target course section
- `onSuccess` - Success callback
- `onError` - Error callback
- `onComplete` - Completion callback

**Features**:

- 7 resource types with visual selector
- File upload (single/multiple)
- URL input for links
- Directory with up to 10 files
- Form validation

### AssignmentForm.tsx

**Props**:

- `courseSectionId` - Target course section
- `userId` - Current user ID
- `onSuccess` - Success callback
- `onError` - Error callback
- `onComplete` - Completion callback

**Features**:

- Title and description inputs
- Due date picker
- Max grade configuration
- Integrated AttachmentManager
- Two-step creation (assignment → attachments)
- Comprehensive error handling
- Partial success reporting

## Benefits

1. **Maintainability**: Each component is 123-521 lines vs 1,276
2. **Testability**: Isolated components easier to unit test
3. **Reusability**: AttachmentManager can be used elsewhere
4. **Type Safety**: Centralized types prevent inconsistencies
5. **Developer Experience**: Easier navigation and modification
6. **Performance**: Smaller components optimize individually

## Usage Example

```tsx
import CourseSectionAddItemModal from '@/components/modals/CourseSectionAddItemModal';

function MyComponent() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <CourseSectionAddItemModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            courseSectionId={123}
            onItemCreated={type => console.log(`Created ${type}`)}
        />
    );
}
```

## Migration Notes

- ✅ No breaking changes to parent components
- ✅ Same props interface maintained
- ✅ Same behavior preserved
- ✅ All linting passes
- ✅ Build compiles successfully
