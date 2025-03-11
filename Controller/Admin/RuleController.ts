import { Router } from "express";
import { userService, adminService } from "../../index.js";
import { UserModel } from "../../utils/entity/UserModel.js";

const router: Router = Router();

router.get('/', async (req, res) => {
    var token = req.headers.authorization;

    var user: UserModel = await userService.getUserDataByToken(token);

    if (user === null) {
        return res.status(500).json({ error: "User not found" });
    }

    if (user.player_permission < 90) {
        return res.status(500).json({ error: "Not enough Permission" })
    }

    return res.status(200).json(await adminService.getRules());
});

router.get('/:rule', async (req, res) => {
    var token = req.headers.authorization;

    var user: UserModel = await userService.getUserDataByToken(token);

    if (user === null) {
        return res.status(500).json({ error: "User not found" });
    }

    if (user.player_permission < 90) {
        return res.status(500).json({ error: "Not enough Permission" })
    }

    var result = await adminService.getRuleById(parseInt(req.params.rule));
    return res.status(200).json(result);
});

router.post('/:rule/update', async (req, res) => {
    var token = req.headers.authorization;

    var user: UserModel = await userService.getUserDataByToken(token);

    if (user === null) {
        return res.status(500).json({ error: "User not found" });
    }

    if (user.player_permission < 90) {
        return res.status(500).json({ error: "Not enough Permission" })
    }

    await adminService.updateRule(parseInt(req.params.rule), req.body);
    return res.status(200).json();
});

router.post('/:rule/delete', async (req, res) => {
    var token = req.headers.authorization;

    var user: UserModel = await userService.getUserDataByToken(token);

    if (user === null) {
        return res.status(500).json({ error: "User not found" });
    }

    if (user.player_permission < 90) {
        return res.status(500).json({ error: "Not enough Permission" })
    }

    await adminService.deleteRule(parseInt(req.params.rule));
    return res.status(200).json();
});

router.post('/add', async (req, res) => {
    var token = req.headers.authorization;

    var user: UserModel = await userService.getUserDataByToken(token);

    if (user === null) {
        return res.status(500).json({ error: "User not found" });
    }

    if (user.player_permission < 90) {
        return res.status(500).json({ error: "Not enough Permission" })
    }

    return res.status(200).json(await adminService.addRule());
});

export const AdminRuleRouter: Router = router;
