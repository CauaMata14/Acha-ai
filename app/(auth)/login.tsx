import { Link, router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInputInstance,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { cores } from '@/constants/cores';
import { useAuth } from '@/hooks/useAuth';
import { mensagemDeErro } from '@/services/auth';
import { validarEmail, validarSenha } from '@/utils/validacao';

export default function Login() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const senhaRef = useRef<TextInputInstance>(null);

  // Os erros dos campos só aparecem depois da primeira tentativa e se atualizam enquanto o usuário digita
  const erros = {
    email: tentouEnviar ? validarEmail(email) : null,
    senha: tentouEnviar ? validarSenha(senha) : null,
  };

  async function handleEntrar() {
    setTentouEnviar(true);
    setErroGeral(null);
    if (validarEmail(email) || validarSenha(senha)) return;

    setCarregando(true);
    try {
      await entrar(email, senha);
      router.replace('/');
    } catch (erro) {
      setErroGeral(mensagemDeErro(erro));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>AchaAí</Text>
          <Text style={styles.subtitulo}>Entre para encontrar ou devolver objetos no campus</Text>
        </View>

        {erroGeral && (
          <View style={styles.alertaErro} accessibilityRole="alert">
            <Text style={styles.alertaErroTexto}>{erroGeral}</Text>
          </View>
        )}

        <Input
          label="E-mail"
          placeholder="nome@iesb.edu.br"
          value={email}
          onChangeText={setEmail}
          erro={erros.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => senhaRef.current?.focus()}
          editable={!carregando}
        />
        <Input
          ref={senhaRef}
          label="Senha"
          placeholder="Sua senha"
          value={senha}
          onChangeText={setSenha}
          erro={erros.senha}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleEntrar}
          editable={!carregando}
        />

        <View style={styles.acoes}>
          <Button titulo="Entrar" onPress={handleEntrar} carregando={carregando} />
        </View>

        <View style={styles.rodape}>
          <Text style={styles.rodapeTexto}>Ainda não tem conta? </Text>
          <Link href="/cadastro" style={styles.link}>
            Cadastre-se
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  cabecalho: {
    alignItems: 'center',
    marginBottom: 32,
  },
  titulo: {
    fontSize: 36,
    fontWeight: '800',
    color: cores.primaria,
  },
  subtitulo: {
    marginTop: 8,
    fontSize: 15,
    textAlign: 'center',
    color: cores.textoSuave,
  },
  alertaErro: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: cores.erroFundo,
  },
  alertaErroTexto: {
    color: cores.erro,
    fontSize: 14,
    textAlign: 'center',
  },
  acoes: {
    marginTop: 8,
  },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 24,
  },
  rodapeTexto: {
    fontSize: 15,
    color: cores.textoSuave,
  },
  link: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.primaria,
  },
});
