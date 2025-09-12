import { Router } from 'express';
import { PositionController } from '../controllers/positionController';

const router = Router();
const positionController = new PositionController();

// CREATE: POST /api/positions
router.post('/', (req, res) => positionController.createPosition(req, res));

// CREATE BATCH: POST /api/positions/batch
router.post('/batch', (req, res) => positionController.createPositions(req, res));

// READ: GET /api/positions
router.get('/', (req, res) => positionController.getPositions(req, res));

// READ ONE: GET /api/positions/:id
router.get('/:id', (req, res) => positionController.getPosition(req, res));

// UPDATE: PUT /api/positions/:id
router.put('/:id', (req, res) => positionController.updatePosition(req, res));

// DELETE: DELETE /api/positions/:id
router.delete('/:id', (req, res) => positionController.deletePosition(req, res));

export default router;