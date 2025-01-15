import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Stack,
  IconButton,
  Box,
  Button,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const FormFieldEditor = ({ field, onUpdate }) => {
  const handleChange = (key, value) => {
    onUpdate({ [key]: value });
  };

  const handleAddOption = () => {
    const newOptions = [...field.options, `Option ${field.options.length + 1}`];
    onUpdate({ options: newOptions });
  };

  const handleUpdateOption = (index, value) => {
    const newOptions = [...field.options];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  const handleDeleteOption = (index) => {
    const newOptions = field.options.filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Field Properties
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Stack spacing={3}>
        <TextField
          label="Field Label"
          value={field.label}
          onChange={(e) => handleChange('label', e.target.value)}
          fullWidth
        />

        {field.type !== 'checkbox' && field.type !== 'file' && (
          <TextField
            label="Placeholder"
            value={field.placeholder || ''}
            onChange={(e) => handleChange('placeholder', e.target.value)}
            fullWidth
          />
        )}

        <FormControlLabel
          control={
            <Switch
              checked={field.required}
              onChange={(e) => handleChange('required', e.target.checked)}
            />
          }
          label="Required"
        />

        {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Options
            </Typography>
            {field.options.map((option, index) => (
              <Box key={index} sx={{ display: 'flex', mb: 1, gap: 1 }}>
                <TextField
                  size="small"
                  value={option}
                  onChange={(e) => handleUpdateOption(index, e.target.value)}
                  fullWidth
                />
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => handleDeleteOption(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddOption}
              size="small"
              sx={{ mt: 1 }}
            >
              Add Option
            </Button>
          </Box>
        )}

        {field.type === 'text' && (
          <TextField
            label="Maximum Length"
            type="number"
            value={field.validation?.maxLength || ''}
            onChange={(e) => handleChange('validation', {
              ...field.validation,
              maxLength: e.target.value
            })}
            fullWidth
          />
        )}

        {field.type === 'number' && (
          <Stack spacing={2}>
            <TextField
              label="Minimum Value"
              type="number"
              value={field.validation?.min || ''}
              onChange={(e) => handleChange('validation', {
                ...field.validation,
                min: e.target.value
              })}
              fullWidth
            />
            <TextField
              label="Maximum Value"
              type="number"
              value={field.validation?.max || ''}
              onChange={(e) => handleChange('validation', {
                ...field.validation,
                max: e.target.value
              })}
              fullWidth
            />
          </Stack>
        )}

        {field.type === 'file' && (
          <Stack spacing={2}>
            <TextField
              label="Allowed File Types"
              placeholder="e.g., .pdf,.doc,.docx"
              value={field.validation?.allowedTypes || ''}
              onChange={(e) => handleChange('validation', {
                ...field.validation,
                allowedTypes: e.target.value
              })}
              fullWidth
            />
            <TextField
              label="Maximum File Size (MB)"
              type="number"
              value={field.validation?.maxSize || ''}
              onChange={(e) => handleChange('validation', {
                ...field.validation,
                maxSize: e.target.value
              })}
              fullWidth
            />
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export default FormFieldEditor;
