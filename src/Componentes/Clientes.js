import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../services/api';

// Register the necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Create an Alert component from MUI
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Slide transition for Snackbar
function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

const Clientes = () => {
  const [rows, setRows] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [visitasData, setVisitasData] = useState([]);

  const handleConfirmAction = () => {
    // Actualizamos el estado del usuario en la tabla
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.idUsuario === selectedUserId) {
          const nuevoEstado = row.estado === 'Baneado' ? 'Activo' : 'Baneado';
          setActionMessage(
            nuevoEstado === 'Baneado'
              ? `Acceso quitado a ${row.nombre}`
              : `${row.nombre} ha sido desbaneado`
          );
          return { ...row, estado: nuevoEstado };
        }
        return row;
      })
    );

    // Llamamos al backend para actualizar el estado del usuario
    api
      .patch(`/api/usuarios/actualizar/${selectedUserId}`)
      .then((response) => {
        console.log('Estado actualizado correctamente:', response.data);
      })
      .catch((error) => {
        console.error('Error al actualizar el estado del usuario:', error);
      });

    setOpenSnackbar(true);
    setOpenDialog(false);
  };

  const handleQuitarAcceso = (id) => {
    setSelectedUserId(id);
    setOpenDialog(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleRoleChange = (id, newRole) => {
    // Primero actualizamos el estado local de la fila en la tabla
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.idUsuario === id) {
          setActionMessage(`El rol de ${row.nombre} ha sido actualizado a ${newRole}`);
          return {
            ...row,
            rol: { ...row.rol, roles: newRole }, // Actualizamos el campo roles dentro de rol
          };
        }
        return row;
      })
    );
  
    // Llamamos a la API para actualizar el rol del usuario en el backend
    api
      .put(`/api/usuarios/actualizarRol/${id}`, { rol: newRole })
      .then((response) => {
        console.log('Rol actualizado correctamente:', response.data);
        setOpenSnackbar(true); // Mostrar mensaje de éxito
      })
      .catch((error) => {
        console.error('Error al actualizar el rol del usuario:', error);
        setOpenSnackbar(true); // Mostrar mensaje de error
        setActionMessage('Error al actualizar el rol.');
      });
  };
  

  const columns = [
    { field: 'idUsuario', headerName: 'ID', width: 90 },
    { field: 'nombre', headerName: 'Nombre', width: 220 },
    { field: 'correo', headerName: 'Email', width: 220 },
    { field: 'telefono', headerName: 'Celular', width: 220 },
    { field: 'direccion', headerName: 'Direccion', width: 300 },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 150,
      renderCell: (params) => (
        <span
          className={params.value === 'Activo' ? 'text-green-600' : 'text-red-600'}
        >
          {params.value.charAt(0).toUpperCase() + params.value.slice(1)}
        </span>
      ),
    },
    {
      field: 'rol.roles',
      headerName: 'Rol',
      width: 150,
      renderCell: (params) => (
        <FormControl
          fullWidth
          size="small"
          variant="outlined"
          sx={{
            minWidth: 80,
            height: 40,
            borderColor: 'white',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'white',
              },
              '&:hover fieldset': {
                borderColor: 'white',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
            },
          }}
        >
          <InputLabel
            id={`role-select-label-${params.row.idUsuario}`}
            sx={{ fontSize: '0.75rem', color: 'white' }}
          >
            Rol
          </InputLabel>
          <Select
            labelId={`role-select-label-${params.row.idUsuario}`}
            value={params.row.rol.roles || ''}
            onChange={(e) => handleRoleChange(params.row.idUsuario, e.target.value)}
            size="small"
            sx={{
              fontSize: '0.75rem',
              color: 'white',
              backgroundColor: '#000000',
              '& .MuiSelect-icon': {
                color: 'white',
              },
              '& .MuiMenuItem-root': {
                color: 'black',
                backgroundColor: '#000000',
                '&:hover': {
                  backgroundColor: '#444',
                },
              },
            }}
          >
            <MenuItem value={'cliente'} style={{ fontSize: '0.75rem', color: 'black' }}>
              cliente
            </MenuItem>
            <MenuItem value={'vendedor'} style={{ fontSize: '0.75rem', color: 'black' }}>
              vendedor
            </MenuItem>
          </Select>
        </FormControl>
      ),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 300,
      renderCell: (params) => (
<Button
  variant="contained"
  sx={{
    backgroundColor: params.row.estado === 'Baneado' ? '#1976d2' : '#FF5722', // Rojo para "Baneado" y Azul para "Activo"
    color: 'white',
  }}
  onClick={() => handleQuitarAcceso(params.row.idUsuario)}
  style={{ margin: '0 4px' }}
>
  {params.row.estado === 'Baneado' ? 'Desbanear' : 'Quitar Acceso'}
</Button>
      ),
    },
  ];

  useEffect(() => {
    api
      .get('/api/usuarios/listar')
      .then((response) => {
        setRows(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener los usuarios:', error);
      });

    api
      .get('/api/usuarios/devolverEstadisticas')
      .then((response) => {
        setVisitasData(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener los datos de visitas:', error);
      });
  }, []);

  // Datos para el gráfico
  const data = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    datasets: [
      {
        label: 'Visitas en el último año',
        data: Array(12).fill(0), // Inicializamos los datos en 0
        backgroundColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  // Si los datos se han cargado, actualizamos el array `data` con los totales de visitas
  if (visitasData.length > 0) {
    visitasData.forEach((visit) => {
      const monthIndex = visit.mes - 1; // Los meses en el backend pueden ser 1-12, ajustamos a índice 0-11
      data.datasets[0].data[monthIndex] = visit.totalVisitas;
    });
  }

  // Opciones para el gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white',
        },
      },
      title: {
        display: true,
        color: 'white',
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(128, 128, 128, 0.5)',
          borderDash: [5, 5],
        },
      },
      y: {
        ticks: {
          color: 'white',
        },
        grid: {
          color: 'rgba(128, 128, 128, 0.5)',
          borderDash: [5, 5],
        },
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-8 bg-fondo">
      <h1 className="text-xl sm:text-3xl font-bold mb-4 text-white text-center">Visitas a lo largo del Año</h1>
      <div className={'bg-bgper rounded-3xl shadow-sm  h-128 p-3 w-full max-w-full mb-8'} style={{ height: '500px' }}>
        <Bar data={data} options={options} />
      </div>

      <div className="w-full bg-bgper p-5 sm:p-10 rounded-2xl">
        <h1 className="text-xl sm:text-3xl font-bold mb-4 text-white text-center">Administrar Clientes</h1>
        <div className="bg-bgper" style={{ height: '400px', width: '100%', overflowY: 'auto' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            getRowId={(row) => row.idUsuario} // Usamos `idUsuario` como el ID
            sx={{
              '& .MuiDataGrid-cell': {
                color: 'white',
              },
              '& .MuiDataGrid-columnHeaders': {
                color: 'black',
                backgroundColor: '#FFFFFF',
              },
              '& .MuiDataGrid-footerContainer': {
                backgroundColor: '#FFFFFF',
              },
            }}
          />
          {rows.length === 0 && (
            <div style={{ textAlign: 'center', color: 'white' }}>No hay datos para mostrar</div>
          )}
        </div>
      </div>

      {/* Snackbar with Slide animation at the bottom right */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={SlideTransition}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {actionMessage}
        </Alert>
      </Snackbar>

      {/* Confirmation dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirmar acción"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que deseas continuar con esta acción?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmAction} color="secondary" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Clientes;
