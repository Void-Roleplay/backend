import { Router } from "express";
import { userService, adminService } from "../../index.js";
import { UserModel } from "../../utils/entity/UserModel.js";

const router: Router = Router();

router.post('/:username/update', async (req, res) => {
    var token = req.headers.authorization;

    var user: UserModel = await userService.getUserDataByToken(token);

    if (user === null) {
        return res.status(500).json({ error: "User not found" });
    }

    if (user.player_permission < 700) {
        return res.status(500).json({ error: "Not enough Permission" })
    }

    var targetUser: UserModel | null = await userService.findByNameAsync(req.params.username);

    if (targetUser === null) {
        return res.status(404).send();
    }

    await adminService.updateUserProfile(req.params.username, req.body);

    return res.status(200).send();
});

export const AdminProfileRouter: Router = router;
