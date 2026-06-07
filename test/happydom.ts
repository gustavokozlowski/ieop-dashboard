// Registra o DOM global ANTES de qualquer import do testing-library
// (que liga o `screen` a document.body no momento da avaliação do módulo).
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();
