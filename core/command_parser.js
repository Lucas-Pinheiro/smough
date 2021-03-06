function CommandPromise(command) {
    var self = this;

    var _actions = {
        "cep_address": () => {
            console.log(`${Command.COMMANDS.cep_address} command executed`);
        },
        "package_status": () => {
            console.log(`${Command.COMMANDS.package_status} command executed`);
        },
        "help": () => {
            console.log(`${Command.COMMANDS.help} command executed`);
        },
        "error": (error) => {
            console.log(`code: ${error.code}; message: ${error.message}`);
        }
    };

    self._command = new Command(command);

    self.on_help = (help_callback) => {
        if (help_callback instanceof Function)
            _actions.help = help_callback;

        return self;
    };

    self.on_cep_address = (cep_address_callback) => {
        if (cep_address_callback instanceof Function)
            _actions.cep_address = cep_address_callback;

        return self;
    };

    self.on_package_status = (package_status_callback) => {
        if (package_status_callback instanceof Function)
            _actions.package_status = package_status_callback;

        return self;
    };

    self.on_error = (error_callback) => {
        if (error_callback instanceof Function)
            _actions.error = error_callback;

        return self;
    };

    self.fail = (error) => {
        _actions.error(error);
    };

    self.resolve = () => {
        if (self._command.error) {
            _actions.error(self._command.error);
            return;
        }

        switch (self._command.command) {
            case Command.COMMANDS.cep_address:
                _actions.cep_address(self._command.args.cep);
                break;
            case Command.COMMANDS.help:
                _actions.help();
                break;
            case Command.COMMANDS.package_status:
                _actions.package_status(self._command.args.package_code);
                break;
        }
    };
}

function Command(command_str) {
    var self = this;

    var splitted_command = command_str.split(" ");

    self.command = splitted_command[0];
    self.args = {};

    switch (self.command) {
        case Command.COMMANDS.cep_address:
            if (!splitted_command[1]) {
                self.error = new CommandError(CommandError.ERROR_CODES.no_cep_args);
                break;
            } else if (!Command.ARGS_REGEX.cep.test(splitted_command[1])) {
                self.error = new CommandError(CommandError.ERROR_CODES.unknown_cep_format);
                break;
            }

            self.args.cep = splitted_command[1];
            break;
        case Command.COMMANDS.help:
            break;
        case Command.COMMANDS.package_status:
            if (!splitted_command[1]) {
                self.error = new CommandError(CommandError.ERROR_CODES.no_package_args);
                break;
            } else if (!Command.ARGS_REGEX.package.test(splitted_command[1].toUpperCase())) {
                self.error = new CommandError(CommandError.ERROR_CODES.unknown_package_format);
                break;
            }

            self.args.package_code = splitted_command[1].toUpperCase();
            break;
        default:
            self.error = new CommandError(CommandError.ERROR_CODES.unknown_command);
    }
}

Command.COMMANDS = {
    "cep_address": "/cep",
    "help": "/help",
    "package_status": "/rastrear"
};

Command.ARGS_REGEX = {
    "cep": /^[0-9]{8}$/,
    "package": /^[0-9A-Z]{13}$/
};

function CommandError(error) {
    var self = this;

    self.code = error.code;
    self.message = error.message;
}

CommandError.ERROR_CODES = {
    "unknown_command": {
        "code": "1",
        "message": "O comando digitado não foi reconhecido"
    },
    "unknown_cep_format": {
        "code": "2",
        "message": "O CEP inserido não está no formato correto"
    },
    "unknown_cep": {
        "code": "3",
        "message": "O CEP inserido não existe"
    },
    "unknown_package_format": {
        "code": "4",
        "message": "O código de rastreamento inserido não está no formato correto"
    },
    "unknown_package": {
        "code": "5",
        "message": "O pacote informado não existe"
    },
    "no_cep_args": {
        "code": "6",
        "message": `Você enviou o comando '${Command.COMMANDS.cep_address}' sem o número do CEP`
    },
    "no_package_args": {
        "code": "7",
        "message": `Você enviou o comando '${Command.COMMANDS.package_status}' sem o código de rastreamento`
    }
};


exports.CommandPromise = CommandPromise;
exports.CommandError = CommandError;
