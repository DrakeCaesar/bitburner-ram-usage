import { NS } from "@nsdefs";

import { INetscriptExtra } from "./NetscriptFunctions/Extra";

export type NSFull = Readonly<
    Omit<NS & INetscriptExtra, "pid" | "args" | "enums">
>;
