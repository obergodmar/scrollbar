{
  pkgs,
  ...
}:
let
  packageJson = builtins.fromJSON (builtins.readFile ./package.json);
  npmScripts = packageJson.scripts or { };

  sanitizeScriptName = name: builtins.replaceStrings [ ":" "/" " " ] [ "-" "-" "-" ] name;

  npmScriptNames = builtins.attrNames npmScripts;
  devenvScriptNames = map (name: "sbar-${sanitizeScriptName name}") npmScriptNames;
  uniqueDevenvScriptNames = builtins.attrNames (
    builtins.listToAttrs (
      map (name: {
        inherit name;
        value = true;
      }) devenvScriptNames
    )
  );

  generatedScripts = builtins.listToAttrs (
    map (name: {
      name = "sbar-${sanitizeScriptName name}";
      value = {
        exec = "pnpm run ${name}";
      };
    }) npmScriptNames
  );
in
assert builtins.length devenvScriptNames == builtins.length uniqueDevenvScriptNames;
{
  cachix.enable = false;
  languages.typescript.enable = true;
  packages = with pkgs; [
    nodejs_latest
    pnpm
  ];

  scripts = generatedScripts;

  enterShell = ''
    echo "devenv scripts are generated from package.json with sbar- prefix."
  '';
}
