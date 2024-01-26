<?php
/**
 * 이 파일은 아이모듈 회원모듈의 일부입니다. (https://www.imodules.io)
 *
 * 관리자 로그인을 처리한다.
 *
 * @file /modules/member/processes/login.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 *
 * @var \modules\member\Member $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

if ($me->isLogged() == true) {
    $results->success = false;
    $results->message = $me->getErrorText('ALREADY_LOGGED');
    return;
}

$errors = [];
$email = Input::get('email', $errors);
$password = Input::get('password', $errors);
$auto_login = Input::get('auto_login') === 'true';

if (count($errors) == 0) {
    $login = $me->login($email, $password, $auto_login);

    if ($login === true) {
        $results->success = true;
    } else {
        $results->success = false;
        $results->message = $login;
    }
} else {
    $results->success = false;
    $results->errors = $errors;
}
