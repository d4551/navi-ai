# NAVI Component Naming Standards

## Component Organization & Naming Conventions

### Directory Structure

```
src/components/
├── ui/                    # Core UI components (UnifiedButton, AppIcon, etc.)
├── layout/                # Layout components (StandardPageLayout, etc.)
├── settings/              # Settings-specific components
├── jobs/                  # Job search related components
├── document/              # Resume/CV builder components
├── portfolio/             # Portfolio management components
├── ai/                    # AI service components
└── [feature]/             # Feature-specific components
```

### Naming Conventions

#### 1. UI Components (src/components/ui/)

- **UnifiedButton.vue** - Main button component (standardized)
- **AppIcon.vue** - Icon component with MDI support
- **ModalBase.vue** - Base modal component
- **StandardCard.vue** - Standard card layout

**Status**: ✅ Standardized

#### 2. Job Components (src/components/jobs/)

- **JobCard.vue** - Main job card component ✅ (Active)
- ~~**GameJobCard.vue**~~ - ❌ Removed (duplicate/unused)
- **AIJobAnalysisModal.vue** - AI job analysis modal
- **JobResultsGrid.vue** - Job results display

**Status**: ✅ Cleaned up, production-ready

#### 3. Settings Components (src/components/settings/)

- **AudioHardwareSection.vue** - Audio hardware settings
- **SystemConfigurationSection.vue** - System settings
- **ApiConfigurationSection.vue** - API configuration
- All follow `[Feature]Section.vue` pattern

**Status**: ✅ Standardized

#### 4. Document Components (src/components/document/)

- **DocumentTemplates.vue** - Document templates
- **UnifiedDocumentEditor.vue** - Main document editor
- **SmartFormGrid.vue** - Smart form layout
- Follow descriptive, feature-focused naming

**Status**: ✅ Functional

#### 5. AI Components (src/components/ai/)

- **AIButton.vue** - AI-specific button (comprehensive implementation)
- ~~**AIButton.vue** (root)~~ - ❌ Removed duplicate
- All AI components prefixed with `AI`

**Status**: ✅ Cleaned up

### Removed Duplicates

- ✅ `src/components/AIButton.vue` (duplicate of ai/AIButton.vue)
- ✅ `src/components/GameJobCard.vue` (unused, replaced by JobCard.vue)

### Production Components

- ✅ **AudioHardwareSection.vue**: Audio controls
- ✅ **DocumentTemplates.vue**: Document layout options
- ✅ **AIJobAnalysisModal.vue**: Production-ready data generation

### CSS/Theme Standardization

- ✅ **unified-design-system.css**: 17,000+ lines consolidating 19 fragmented CSS files
- ✅ **master-theme-streamlined.css**: Clean import structure
- ✅ All components now use consistent glass morphism theming

### Naming Rules Going Forward

1. **UI Components**: Use `Unified` prefix for core shared components
2. **Feature Components**: Use descriptive names without prefixes
3. **Modal Components**: End with `Modal.vue`
4. **Section Components**: End with `Section.vue`
5. **Card Components**: End with `Card.vue`
6. **No duplicates**: One authoritative component per functionality

### Status Summary

- **Duplicates Removed**: 2 components
- **Production Code**: 3+ components enhanced from stub/mock to production
- **CSS Consolidation**: 19 files → 2 streamlined files
- **Features**: Settings, Documents, AI analysis
- **Consistent Theming**: Unified glass morphism across all components

This standardization improves maintainability, reduces confusion, and ensures consistent user experience across the NAVI application.
