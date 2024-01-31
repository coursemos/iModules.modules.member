<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * OAuth 계정연동을 처리한다.
 *
 * @file /modules/member/processes/oauth.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 *
 * @var \modules\member\Member $me
 */
Header::type('html');

sleep(2);

$mode = Input::get('mode');
if (in_array($mode, ['password', 'signup', 'login']) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('INVALID_OAUTH_LINK_CODE');
    return;
}

$code = Input::get('code') === null ? false : Password::decode(Input::get('code'));
$code = $code === false ? null : json_decode($code);
if ($code === null) {
    $results->success = false;
    $results->message = $me->getErrorText('INVALID_OAUTH_LINK_CODE');
    return;
}

$client = $me->getOAuthClient($code->oauth_id);
if ($client === null) {
    $results->success = false;
    $results->message = $me->getErrorText('NOT_FOUND_OAUTH_CLIENT');
    return;
}

$oauth = new OAuthClient($client->getClientId(), $client->getClientSecret());
$oauth
    ->setScope($client->getScope())
    ->setAccessToken($code->access_token ?? null, $code->access_token_expired_at ?? 0, $code->scope ?? null)
    ->setRefreshToken($code->refresh_token ?? null);

$account = new \modules\member\dtos\OAuthAccount($client, $oauth);
$account->setUser($code->user);

if ($account->isValid() === false) {
    $results->success = false;
    $results->message = $me->getErrorText('OAUTH_INVALID_ACCOUNT');
    return;
}

if ($mode == 'password') {
    if ($me->isLogged() == false) {
        $results->success = false;
        $results->message = $me->getErrorText('LOGOUTED');
        return;
    }

    $errors = [];
    $password = Input::get('password', $errors);

    if (count($errors) == 0) {
        $member = $me
            ->db()
            ->select(['member_id', 'password'])
            ->from($me->table('members'))
            ->where('member_id', $me->getLogged())
            ->getOne();

        if ($member === null) {
            $results->success = false;
            $results->message = $me->getErrorText('NOT_FOUND_MEMBER');
            return;
        }

        if (\Password::verify($password, $member?->password ?? '') === true) {
            $success = $me->getMember($member->member_id)->setOAuthAccount($account);
            $results->success = true;
            $results->redirect = $account->getOAuth()->redirect(false);
        } else {
            $results->success = false;
            $results->message = $me->getErrorText('INVALID_PASSWORD');
        }
    } else {
        $results->success = false;
        $results->errors = $errors;
    }
    return;
}

if ($mode == 'login') {
    $errors = [];
    $email = Input::get('email', $errors);
    $password = Input::get('password', $errors);

    if (count($errors) == 0) {
        $login = $me->login($email, $password, false);

        if ($login === true) {
            $success = $me->setOAuthAccount($account);
            $results->success = $success;
            if ($success == true) {
                $results->redirect = $account->getOAuth()->redirect(false);
            } else {
                $results->message = $me->getErrorText('OAUTH_ACCOUNT_LINK_FAILED');
            }
        } else {
            $results->success = false;
            $results->message = $login;
        }
    } else {
        $results->success = false;
        $results->errors = $errors;
    }
    return;
}

if ($mode == 'signup') {
    if ($client->isAllowSignup() === false) {
        $results->success = true;
        $results->message = $me->getErrorText('OAUTH_NOT_ALLOWED_SIGNUP');
        return;
    }

    $email = Input::get('email');
    $password = Input::get('password');
    $nickname = Input::get('nickname');

    $member = [];
    $member['email'] = Input::get('email');
    $member['password'] = Input::get('password');
    $member['nickname'] = Input::get('nickname');
    $member['verified'] = 'TRUE';

    $member_id = $me->addMember($member);
    if (is_int($member_id) == false) {
        $results->success = false;
        if (is_array($member_id) == true) {
            $results->errors = $member_id;
        }
        return;
    }

    $me->loginTo($member_id);
    $success = $me->getMember()->setOAuthAccount($account);
    $results->success = $success;
    if ($success == true) {
        $results->redirect = $account->getOAuth()->redirect(false);
    } else {
        $results->message = $me->getErrorText('OAUTH_ACCOUNT_LINK_FAILED');
    }
}

$results->success = false;
$results->message = $me->getErrorText('INVALID_OAUTH_LINK_CODE');
