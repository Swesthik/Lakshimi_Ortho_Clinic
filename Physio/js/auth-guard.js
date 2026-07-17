/**
 * ReviveCMS - Reusable Authentication Guard Module
 * Simply loads and executes the centralized verification pipeline.
 */

import { RequireAuthentication } from './auth.js';
import { Logger } from './logger.js';

Logger.info('AuthGuard', 'Authentication Guard loaded.');
RequireAuthentication();
