import { Router } from 'express';
import { checkAuthMiddleware } from '../middleware/checkAuthMiddleware.js';
import {
    createSwapRequest,
    getMySwapRequests,
    acceptSwapRequest,
    rejectSwapRequest,
    cancelSwapRequest,
    completeSwap,
    getSwapDetails
} from '../controllers/swap.controller.js';

const router = Router();

// All swap routes require authentication
router.use(checkAuthMiddleware);

// Create a new swap request
router.post('/', createSwapRequest);

// Get current user's swap requests (with optional filtering)
router.get('/', getMySwapRequests);

// Get specific swap details
router.get('/:swapId', getSwapDetails);

// Accept a swap request (recipient only)
router.put('/:swapId/accept', acceptSwapRequest);

// Reject a swap request (recipient only)
router.put('/:swapId/reject', rejectSwapRequest);

// Cancel a swap request (requester only)
router.delete('/:swapId/cancel', cancelSwapRequest);

// Mark swap as completed (both parties)
router.put('/:swapId/complete', completeSwap);

export default router;
