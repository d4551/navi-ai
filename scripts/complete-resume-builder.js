#!/usr/bin/env node

/**
 * Script to complete the resume builder conversion to tabbed interface
 */

const fs = require('fs');
const path = require('path');

const resumeBuilderPath = '/workspaces/navi2/src/views/ResumeBuilder.vue';

// Read the current file
let content = fs.readFileSync(resumeBuilderPath, 'utf8');

// Update the experience section header
content = content.replace(
  /(<v-card class="step-card" elevation="0" rounded="lg">\s*<v-card-title class="d-flex align-center">\s*<v-icon color="primary" class="me-2">mdi-briefcase<\/v-icon>\s*Work Experience\s*<v-spacer \/>)\s*(<v-btn[^>]*>[\s\S]*?<\/v-btn>)\s*(<\/v-card-title>)/,
  `$1
                              <v-btn
                                variant="outlined"
                                size="small"
                                prepend-icon="mdi-robot"
                                class="me-2"
                                @click="showAIAssistant = true"
                              >
                                AI Help
                              </v-btn>
                              $2
                            $3`
);

// Complete window items structure by finding and replacing template structure
content = content.replace(
  /<\/v-card>\s*<\/template>/g,
  '</v-card>\n                        </v-window-item>'
);

content = content.replace(
  /<template #item\.(\d+)>/g,
  '<v-window-item value="$1">'
);

// Write back the file
fs.writeFileSync(resumeBuilderPath, content);

console.log('Resume builder conversion completed!');