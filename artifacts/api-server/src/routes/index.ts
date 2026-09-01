import { Router, type IRouter } from "express";
import healthRouter from "./health";
import commissionRouter from "./commission";

const router: IRouter = Router();

router.use(healthRouter);
router.use(commissionRouter);

export default router;
