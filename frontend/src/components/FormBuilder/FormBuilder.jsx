import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  IconButton, 
  Button,
  Grid,
  Divider,
  TextField
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Add as AddIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import FormFieldToolbox from './FormFieldToolbox';
import FormFieldEditor from './FormFieldEditor';

const FormBuilder = () => {
  const [formTitle, setFormTitle] = useState('Untitled Form');
  const [formDescription, setFormDescription] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormFields(items);
  };

  const handleAddField = (fieldType) => {
    const newField = {
      id: `field-${Date.now()}`,
      type: fieldType,
      label: `New ${fieldType}`,
      required: false,
      options: fieldType === 'select' || fieldType === 'radio' ? ['Option 1'] : [],
      placeholder: '',
      validation: {}
    };

    setFormFields([...formFields, newField]);
    setSelectedField(newField);
  };

  const handleFieldUpdate = (fieldId, updates) => {
    const updatedFields = formFields.map(field => 
      field.id === fieldId ? { ...field, ...updates } : field
    );
    setFormFields(updatedFields);
  };

  const handleDeleteField = (fieldId) => {
    setFormFields(formFields.filter(field => field.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const handleSaveForm = async () => {
    const formData = {
      title: formTitle,
      description: formDescription,
      fields: formFields
    };

    try {
      // TODO: Implement API call to save form
      console.log('Form data to save:', formData);
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          variant="standard"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          sx={{ mb: 2, '& input': { fontSize: '2rem', fontWeight: 'bold' } }}
        />
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Form Description"
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
          variant="standard"
        />
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <FormFieldToolbox onAddField={handleAddField} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, minHeight: '70vh' }}>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="form-fields">
                {(provided) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{ minHeight: '100%' }}
                  >
                    {formFields.map((field, index) => (
                      <Draggable 
                        key={field.id} 
                        draggableId={field.id} 
                        index={index}
                      >
                        {(provided) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            elevation={1}
                            sx={{ 
                              p: 2, 
                              mb: 2, 
                              cursor: 'pointer',
                              border: selectedField?.id === field.id ? 2 : 0,
                              borderColor: 'primary.main'
                            }}
                            onClick={() => setSelectedField(field)}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <IconButton 
                                size="small" 
                                {...provided.dragHandleProps}
                              >
                                <DragIcon />
                              </IconButton>
                              <Typography sx={{ flex: 1, ml: 1 }}>
                                {field.label}
                              </Typography>
                              <IconButton 
                                size="small"
                                onClick={() => handleDeleteField(field.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          {selectedField && (
            <FormFieldEditor 
              field={selectedField}
              onUpdate={(updates) => handleFieldUpdate(selectedField.id, updates)}
            />
          )}
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveForm}
          size="large"
        >
          Save Form
        </Button>
      </Box>
    </Container>
  );
};

export default FormBuilder;
